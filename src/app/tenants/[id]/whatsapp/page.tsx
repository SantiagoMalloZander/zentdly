"use client";

import { useActionState, useState, useTransition } from "react";
import { use } from "react";
import { saveWhatsAppConfig, getEvolutionQR } from "@/lib/actions/whatsapp";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert } from "@/components/Alert";

export default function WhatsAppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [provider, setProvider] = useState<"evolution" | "meta">("evolution");
  const [qr, setQr] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [loadingQr, startQr] = useTransition();
  const [state, action] = useActionState(saveWhatsAppConfig, null);

  const webhookUrl = `https://zentdlyw.vercel.app/api/webhooks/whatsapp`;

  function handleGetQr() {
    startQr(async () => {
      setQr(null);
      setQrError(null);
      const res = await getEvolutionQR(id);
      if (res.error) setQrError(res.error);
      else if (res.qr) setQr(res.qr);
    });
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp</h2>
      <p className="text-sm text-gray-500 mb-6">
        Conectá WhatsApp a este negocio para que el bot pueda recibir y enviar mensajes.
      </p>

      {/* Provider toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setProvider("evolution")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
            provider === "evolution"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
        >
          Evolution API (no oficial)
        </button>
        <button
          onClick={() => setProvider("meta")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
            provider === "meta"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
        >
          Meta Cloud API (oficial)
        </button>
      </div>

      <form action={action} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <input type="hidden" name="tenant_id" value={id} />
        <input type="hidden" name="provider" value={provider} />

        {state?.error && <Alert type="error" message={state.error} />}
        {state?.ok && <Alert type="success" message="Configuración guardada." />}

        {provider === "evolution" ? (
          <>
            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Evolution API conecta WhatsApp escaneando un QR desde el teléfono. Requiere que tu instancia de Evolution esté corriendo.
            </p>

            <Field name="evolution_api_url" label="URL de la API" placeholder="https://evolution.miservidor.com" />
            <Field name="evolution_api_key" label="API Key" placeholder="tu-api-key" type="password" />
            <Field name="evolution_instance_name" label="Nombre de instancia" placeholder="zentdly-negocio" />

            <div className="pt-2 flex gap-3 justify-between items-center">
              <button
                type="button"
                onClick={handleGetQr}
                disabled={loadingQr}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {loadingQr ? "Generando..." : "Generar QR"}
              </button>
              <SubmitButton label="Guardar" />
            </div>

            {qrError && <Alert type="error" message={qrError} />}

            {qr && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-sm text-gray-600">Escaneá este QR desde WhatsApp → Dispositivos vinculados</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`}
                  alt="WhatsApp QR"
                  className="w-56 h-56 border border-gray-200 rounded-lg"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
              Meta Cloud API es la integración oficial de WhatsApp Business. Coexiste con la app de WhatsApp Business en el celular.
            </p>

            <Field name="meta_phone_number_id" label="Phone Number ID" placeholder="123456789012345" />
            <Field name="meta_access_token" label="Access Token" type="password" placeholder="EAABsbCS..." />
            <Field name="meta_verify_token" label="Verify Token" placeholder="un-token-secreto-cualquiera" />
            <Field name="meta_app_secret" label="App Secret" type="password" placeholder="abc123..." />
            <Field name="meta_business_id" label="Business Account ID" placeholder="987654321" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 break-all">
                  {webhookUrl}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  Copiar
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Pegá esta URL en el Meta Developer Dashboard → WhatsApp → Configuración → Webhook.
                Suscribite al campo <strong>messages</strong>.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <SubmitButton label="Guardar" />
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
