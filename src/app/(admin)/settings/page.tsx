import { loadSettings } from "./actions";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  // loadSettings catches all errors internally and returns {} if Supabase isn't ready
  const settings = await loadSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Credenciales y tokens para WhatsApp, OpenAI y Google.
        </p>
      </div>

      {Object.keys(settings).length === 0 && (
        <div className="mb-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Supabase no está conectado todavía. Configurá{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> y{" "}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> en Vercel → Environment
          Variables, luego redeploy.
        </div>
      )}

      <SettingsForm initial={settings} />
    </div>
  );
}
