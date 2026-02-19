import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const colors = await prisma.color.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(colors);
  } catch (error) {
    console.error("GET colors:", error);
    return NextResponse.json({ error: "Erro ao buscar cores" }, { status: 500 });
  }
}
