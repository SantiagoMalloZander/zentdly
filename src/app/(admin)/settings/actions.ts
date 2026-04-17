"use server";

import { createServerClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";

export type SettingsMap = Record<string, string>;

export async function loadSettings(): Promise<SettingsMap> {
  try {
    const db = createServerClient();
    const { data } = await db.from("app_settings").select("key, value");
    if (!data) return {};
    return Object.fromEntries(data.map((r) => [r.key, r.value ?? ""]));
  } catch {
    return {};
  }
}

export async function saveSettings(
  _prev: { ok: boolean; error?: string },
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = createServerClient();

    const rows = Array.from(formData.entries())
      .filter(([key]) => !key.startsWith("$"))
      .map(([key, value]) => ({
        key,
        value: value as string,
        updated_at: new Date().toISOString(),
      }));

    const { error } = await db
      .from("app_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) throw error;

    revalidatePath("/settings");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
