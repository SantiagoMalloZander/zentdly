import { loadSettings } from "./actions";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await loadSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Credenciales y tokens para WhatsApp, OpenAI y Google. Se guardan en la base de datos.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
