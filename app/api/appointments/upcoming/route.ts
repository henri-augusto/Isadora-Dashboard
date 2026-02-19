import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: now }, status: { in: ["pending", "confirmed"] } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 10,
      include: { client: true, braidStyle: true, color: true },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET upcoming:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
