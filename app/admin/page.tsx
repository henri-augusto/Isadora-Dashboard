import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/dateUtils";

async function getSummary() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const entries = await prisma.financeEntry.findMany({
    where: { date: { gte: start, lte: end } },
  });

  const income = entries.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
  const balance = income - expense;

  return { income, expense, balance };
}

async function getUpcomingAppointments() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return prisma.appointment.findMany({
    where: {
      date: { gte: now },
      status: { in: ["pending", "confirmed"] },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    take: 5,
    include: { client: true, braidStyle: true, color: true },
  });
}

export default async function AdminDashboardPage() {
  const [summary, appointments] = await Promise.all([
    getSummary(),
    getUpcomingAppointments(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Receita do mês</p>
          <p className="text-2xl font-bold text-green-800">
            R$ {summary.income.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Despesas do mês</p>
          <p className="text-2xl font-bold text-red-800">
            R$ {summary.expense.toFixed(2)}
          </p>
        </div>
        <div className="bg-jade-50 border border-jade-200 rounded-lg p-4">
          <p className="text-sm text-jade-500 font-medium">Saldo do mês</p>
          <p className="text-2xl font-bold text-jade-500">
            R$ {summary.balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-black text-lg font-semibold mb-4">Próximos agendamentos</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-500">Nenhum agendamento próximo.</p>
        ) : (
          <ul className="space-y-2">
            {appointments.map((apt) => (
              <li
                key={apt.id}
                className="text-black flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <span className="text-black font-medium">{apt.client.name}</span>
                  <span className="text-gray-600 ml-2">
                    {formatDateShort(apt.date)} pela {apt.time}
                  </span>
                </div>
                <span className="text-black text-sm text-gray-500">
                  {apt.braidStyle.name} - {apt.color.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}