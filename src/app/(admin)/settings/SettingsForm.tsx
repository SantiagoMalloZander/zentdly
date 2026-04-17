"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveSettings, type SettingsMap } from "./actions";

interface Props {
  initial: SettingsMap;
}

const initialState = { ok: false, error: undefined as string | undefined };

export default function SettingsForm({ initial }: Props) {
  const [state, action, pending] = useActionState(saveSettings, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="space-y-8 max-w-2xl">
      {state.ok && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Configuración guardada correctamente.
        </div>
      )}
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          Error: {state.error}
        </div>
      )}

      {/* ── Negocio ─────────────────────────────────────── */}
      <Section title="Negocio">
        <Field name="tenant_name" label="Nombre del complejo" defaultValue={initial.tenant_name} />
        <Field
          name="tenant_timezone"
          label="Zona horaria"
          defaultValue={initial.tenant_timezone || "America/Argentina/Buenos_Aires"}
          hint="Ejemplo: America/Argentina/Buenos_Aires"
        />
        <Field
          name="default_tenant_id"
          label="Tenant ID"
          defaultValue={initial.default_tenant_id}
          hint="UUID del tenant en Supabase (ver tabla tenants)"
        />
      </Section>

      {/* ── Supabase ────────────────────────────────────── */}
      <Section title="Supabase" note="Estas variables también deben estar en Vercel → Environment Variables">
        <EnvField label="NEXT_PUBLIC_SUPABASE_URL" envKey="NEXT_PUBLIC_SUPABASE_URL" />
        <EnvField label="NEXT_PUBLIC_SUPABASE_ANON_KEY" envKey="NEXT_PUBLIC_SUPABASE_ANON_KEY" />
        <EnvField label="SUPABASE_SERVICE_ROLE_KEY" envKey="SUPABASE_SERVICE_ROLE_KEY" secret />
      </Section>

      {/* ── WhatsApp ────────────────────────────────────── */}
      <Section title="WhatsApp (Meta Cloud API)">
        <Field
          name="whatsapp_phone_number_id"
          label="Phone Number ID"
          defaultValue={initial.whatsapp_phone_number_id}
          hint="Meta → WhatsApp → Configuration"
        />
        <Field
          name="whatsapp_access_token"
          label="Access Token"
          defaultValue={initial.whatsapp_access_token}
          secret
        />
        <Field
          name="whatsapp_verify_token"
          label="Verify Token"
          defaultValue={initial.whatsapp_verify_token}
          hint="Token arbitrario que vos elegís para verificar el webhook"
        />
        <Field
          name="meta_app_secret"
          label="App Secret"
          defaultValue={initial.meta_app_secret}
          secret
          hint="Meta → App → App Secret (para validar firma del webhook)"
        />
      </Section>

      {/* ── OpenAI ──────────────────────────────────────── */}
      <Section title="OpenAI">
        <Field
          name="openai_api_key"
          label="API Key"
          defaultValue={initial.openai_api_key}
          secret
          hint="platform.openai.com → API keys"
        />
      </Section>

      {/* ── Google ──────────────────────────────────────── */}
      <Section title="Google (Sheets / Calendar)">
        <Field
          name="google_client_email"
          label="Service Account Email"
          defaultValue={initial.google_client_email}
          hint="ej: zentdly@my-project.iam.gserviceaccount.com"
        />
        <Field
          name="google_private_key"
          label="Private Key"
          defaultValue={initial.google_private_key}
          secret
          multiline
          hint="Contenido completo del campo private_key del JSON de la service account"
        />
        <Field
          name="google_sheets_spreadsheet_id"
          label="Spreadsheet ID"
          defaultValue={initial.google_sheets_spreadsheet_id}
          hint="ID en la URL de la planilla: docs.google.com/spreadsheets/d/[ID]"
        />
        <Field
          name="google_calendar_id"
          label="Calendar ID"
          defaultValue={initial.google_calendar_id}
          hint='Generalmente tu email o "primary"'
        />
      </Section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {pending ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
      {note && <p className="text-xs text-amber-600 mb-4">{note}</p>}
      <div className="space-y-4 mt-4">{children}</div>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue = "",
  hint,
  secret = false,
  multiline = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  secret?: boolean;
  multiline?: boolean;
}) {
  const base =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={4}
          className={base}
          placeholder={secret ? "••••••••" : ""}
        />
      ) : (
        <input
          type={secret ? "password" : "text"}
          name={name}
          defaultValue={defaultValue}
          className={base}
          placeholder={secret ? "••••••••" : ""}
          autoComplete="off"
        />
      )}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function EnvField({ label, envKey, secret = false }: { label: string; envKey: string; secret?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={secret ? "password" : "text"}
          readOnly
          value={`Configurar en Vercel → Environment Variables como ${envKey}`}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">
        Esta variable debe setearse directamente en Vercel, no se puede guardar desde aquí.
      </p>
    </div>
  );
}
