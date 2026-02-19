import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-amber-50">
      <h1 className="text-3xl font-bold mb-8 text-amber-800">ISADORA - TRANÇAS</h1>
      <div className="flex gap-4">
        <Link
          href="/agendar"
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          Agendar Horário
        </Link>
        <Link
          href="/admin/login"
          className="px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition"
        >
        Área Admin
        </Link>
      </div>
    </main>
  );
}
