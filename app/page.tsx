import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-cinnabar-50">
      <h1 className="text-3xl font-bold mb-8 text-cinnabar-800">ISADORA - TRANÇAS</h1>
      <div className="flex gap-4">
        <Link
          href="/agendar"
          className="px-6 py-3 bg-cinnabar-600 text-white rounded-lg hover:bg-cinnabar-700 transition"
        >
          Agendar Horário
        </Link>
        <Link
          href="/admin/login"
          className="px-6 py-3 border border-cinnabar-600 text-cinnabar-600 rounded-lg hover:bg-cinnabar-50 transition"
        >
        Área Admin
        </Link>
      </div>
    </main>
  );
}
