import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">
        Bienvenido a Zentdly. Conectá Supabase para ver datos en tiempo real.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Reservas hoy" value="—" />
        <StatCard label="Reservas esta semana" value="—" />
        <StatCard label="Canchas activas" value="—" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
        <h2 className="text-sm font-semibold text-amber-800 mb-2">Configuración pendiente</h2>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>Configurar credenciales de Supabase en Vercel → Environment Variables</li>
          <li>Correr las migraciones SQL en Supabase</li>
          <li>
            Completar tokens de WhatsApp, OpenAI y Google en{" "}
            <Link href="/settings" className="underline font-medium">
              Configuración
            </Link>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Próximas reservas</h2>
        <p className="text-sm text-gray-400">Sin datos — conectá Supabase para ver reservas.</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
