import OpenAI from "openai";
import { createServerClient } from "@/infrastructure/supabase/server";
import { evolutionSendText } from "./evolutionSender";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface EvolutionIncomingMessage {
  instanceName: string;
  from: string;       // phone number without @s.whatsapp.net
  text: string;
  messageId: string;
  pushName?: string;
}

export async function handleEvolutionMessage(msg: EvolutionIncomingMessage): Promise<void> {
  const db = createServerClient();

  // Find tenant by instance name
  const { data: config } = await db
    .from("whatsapp_config")
    .select("tenant_id")
    .eq("evolution_instance_name", msg.instanceName)
    .single();

  if (!config?.tenant_id) {
    console.error("[evolution] No tenant found for instance:", msg.instanceName);
    return;
  }

  const tenantId = config.tenant_id;

  // Get tenant bot prompt
  const { data: tenant } = await db
    .from("tenants")
    .select("bot_prompt, name")
    .eq("id", tenantId)
    .single();

  const botPrompt = tenant?.bot_prompt ?? "Sos un asistente de reservas de canchas deportivas. Respondé en español rioplatense, de forma amigable y breve.";

  // Upsert customer
  const phone = `+${msg.from}`;
  const { data: customer } = await db
    .from("customers")
    .upsert(
      { tenant_id: tenantId, phone_e164: phone, name: msg.pushName ?? null },
      { onConflict: "tenant_id,phone_e164", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (!customer) return;

  // Get or create conversation
  const { data: conversation } = await db
    .from("conversations")
    .upsert(
      { tenant_id: tenantId, customer_id: customer.id, external_chat_id: msg.from, channel: "whatsapp" },
      { onConflict: "tenant_id,external_chat_id", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (!conversation) return;

  // Save inbound message
  await db.from("messages").insert({
    conversation_id: conversation.id,
    direction: "inbound",
    content: msg.text,
    raw_payload: { messageId: msg.messageId },
  });

  // Load last 10 messages for context
  const { data: history } = await db
    .from("messages")
    .select("direction, content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const chatHistory = (history ?? []).reverse().map((m) => ({
    role: m.direction === "inbound" ? "user" as const : "assistant" as const,
    content: m.content,
  }));

  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: botPrompt },
      ...chatHistory,
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) return;

  // Send via Evolution
  await evolutionSendText(msg.instanceName, msg.from, reply);

  // Save outbound message
  await db.from("messages").insert({
    conversation_id: conversation.id,
    direction: "outbound",
    content: reply,
    raw_payload: {},
  });

  // Update last_message_at
  await db
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversation.id);
}
