"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

export function AdminNav({ session }: { session: Session | null }) {
  if (!session) {
    return (
      <Link href="/" className="text-amber-100 hover:text-white">
        Inicio
      </Link>
    );
  }

  return (
    <nav className="flex items-center gap-4">
      <Link href="/admin" className="hover:underline">Home</Link>
      <Link href="/admin/financeiros" className="hover:underline">Finanças</Link>
      <Link href="/admin/clientes" className="hover:underline">Clientes</Link>
      <Link href="/admin/agenda" className="hover:underline">Agenda</Link>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="px-3 py-1 bg-amber-600 rounded hover:bg-amber-800 text-sm"
      >
        Sair
      </button>
    </nav>
  );
}
