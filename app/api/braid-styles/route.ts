import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const styles = await prisma.braidStyle.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(styles);
  } catch (error) {
    console.error("GET braid-styles:", error);
    return NextResponse.json({ error: "Erro ao buscar estilos" }, { status: 500 });
  }
}
