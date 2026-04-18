import { NextRequest, NextResponse } from "next/server";
import { handleEvolutionMessage } from "@/integrations/whatsapp/evolutionOrchestrator";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-key");
  if (auth !== "zentdly-debug-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await handleEvolutionMessage({
      instanceName: "doblecincoolivos",
      from: "214781947971",
      text: "Hola quería sacar una cancha para hoy",
      messageId: "DEBUG-" + Date.now(),
      pushName: "Karen Zander",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
