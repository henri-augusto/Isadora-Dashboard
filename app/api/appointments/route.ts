import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
  clientEmail: z.string().email(),
  date: z.string(),
  time: z.string(),
  braidStyleId: z.string(),
  colorId: z.string(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const forBooking = searchParams.get("forBooking") === "true";

  if (forBooking && date) {
    try {
      // Corrige o problema de timezone: cria as datas no timezone local
      const [year, month, day] = date.split("-").map(Number);
      const start = new Date(year, month - 1, day, 0, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59, 999);

      const booked = await prisma.appointment.findMany({
        where: {
          date: { gte: start, lte: end },
          status: { not: "cancelled" },
        },
        select: { time: true },
      });

      const bookedTimes = booked.map((a) => a.time);
      return NextResponse.json({ bookedTimes });
    } catch (error) {
      console.error("GET appointments for booking:", error);
      return NextResponse.json({ error: "Erro ao buscar horarios" }, { status: 500 });
    }
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const where: Record<string, unknown> = {};
    if (date) {
      // Corrige o problema de timezone: cria as datas no timezone local
      const [year, month, day] = date.split("-").map(Number);
      const start = new Date(year, month - 1, day, 0, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: {
        client: true,
        braidStyle: true,
        color: true,
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET appointments:", error);
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    // Corrige o problema de timezone: cria a data no timezone local
    // data.date vem como "yyyy-MM-dd", então criamos como "yyyy-MM-ddT00:00:00" no timezone local
    const [year, month, day] = data.date.split("-").map(Number);
    const appointmentDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    let client = await prisma.client.findFirst({
      where: {
        OR: [{ email: data.clientEmail }, { phone: data.clientPhone }],
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: data.clientName,
          phone: data.clientPhone,
          email: data.clientEmail,
        },
      });
    } else {
      await prisma.client.update({
        where: { id: client.id },
        data: { name: data.clientName, phone: data.clientPhone, email: data.clientEmail },
      });
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        time: data.time,
        status: { not: "cancelled" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este horario ja esta ocupado. Por favor, escolha outro." },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        date: appointmentDate,
        time: data.time,
        braidStyleId: data.braidStyleId,
        colorId: data.colorId,
        notes: data.notes,
        status: "pending",
      },
      include: {
        client: true,
        braidStyle: true,
        color: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("POST appointment:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}
