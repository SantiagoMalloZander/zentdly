"use server";

import { createServerClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CourtTypeSchema = z.object({
  tenant_id: z.string().uuid(),
  sport_name: z.string().min(1),
  slot_duration_minutes: z.coerce.number().int().positive(),
  open_time: z.string().regex(/^\d{2}:\d{2}$/),
  close_time: z.string().regex(/^\d{2}:\d{2}$/),
  quantity: z.coerce.number().int().positive(),
  price_per_slot: z.coerce.number().optional(),
  days_of_week: z.string().optional(),
});

export async function getCourtTypes(tenantId: string) {
  try {
    const db = createServerClient();
    const { data } = await db
      .from("court_types")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function createCourtType(_prev: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = CourtTypeSchema.safeParse(raw);
  if (!parsed.success) return { error: "Datos inválidos: " + JSON.stringify(parsed.error.issues) };

  const daysRaw = formData.getAll("days_of_week").map(Number);
  const days = daysRaw.length > 0 ? daysRaw : [1, 2, 3, 4, 5, 6, 0];

  const db = createServerClient();
  const { error } = await db.from("court_types").insert({
    ...parsed.data,
    days_of_week: days,
    price_per_slot: parsed.data.price_per_slot ?? null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/tenants/${parsed.data.tenant_id}/courts`);
  return { ok: true };
}

export async function deleteCourtType(_prev: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const tenantId = formData.get("tenant_id") as string;

  const db = createServerClient();
  const { error } = await db.from("court_types").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/tenants/${tenantId}/courts`);
  return { ok: true };
}

export async function toggleCourtType(_prev: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const tenantId = formData.get("tenant_id") as string;
  const active = formData.get("active") === "true";

  const db = createServerClient();
  await db.from("court_types").update({ active: !active }).eq("id", id);
  revalidatePath(`/tenants/${tenantId}/courts`);
  return { ok: true };
}
