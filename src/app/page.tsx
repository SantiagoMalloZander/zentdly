import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 mb-6">
          <span className="text-white text-2xl font-bold">Z</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Zentdly</h1>
        <p className="text-lg text-gray-500 mb-8">
          Automatización de reservas deportivas por WhatsApp.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Ir al panel
        </Link>
      </div>
    </main>
  );
}
