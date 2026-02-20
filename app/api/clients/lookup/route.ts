import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Busca cliente por telefone - endpoint público para o fluxo de agendamento.
 * Remove formatação do telefone (apenas dígitos) para buscar no banco.
 * Telefone: DDD (2) + 9 dígitos = 11 caracteres.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phoneParam = searchParams.get("phone") || "";
  const phoneDigits = normalizePhone(phoneParam);

  if (phoneDigits.length < 10) {
    return NextResponse.json({ client: null });
  }

  try {
    const clients = await prisma.client.findMany();
    const client = clients.find((c) => normalizePhone(c.phone) === phoneDigits) || null;
    return NextResponse.json({ client });
  } catch (error) {
    console.error("GET clients/lookup:", error);
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}
