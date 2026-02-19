import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || String(new Date().getMonth() + 1);
    const year = searchParams.get("year") || String(new Date().getFullYear());

    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const entries = await prisma.financeEntry.findMany({
      where: { date: { gte: start, lte: end } },
    });

    const income = entries.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
    const balance = income - expense;

    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(parseInt(year), parseInt(month) - 1 - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const mEntries = await prisma.financeEntry.findMany({
        where: { date: { gte: mStart, lte: mEnd } },
      });

      const mIncome = mEntries.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
      const mExpense = mEntries.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);

      monthsData.push({
        month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        receita: mIncome,
        despesa: mExpense,
        saldo: mIncome - mExpense,
      });
    }

    return NextResponse.json({
      income,
      expense,
      balance,
      byMonth: monthsData,
    });
  } catch (error) {
    console.error("GET finance summary:", error);
    return NextResponse.json({ error: "Erro ao buscar resumo" }, { status: 500 });
  }
}
