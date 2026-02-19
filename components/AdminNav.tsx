"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import {
  Home,
  Wallet,
  Users,
  Calendar,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/financeiros", label: "Finanças", icon: Wallet },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/agenda", label: "Agenda", icon: Calendar },
];

export function AdminNav({ session }: { session: Session | null }) {
  const pathname = usePathname();

  if (!session) {
    return (
      <aside className="w-64 h-full min-h-[calc(100vh-2rem)] bg-jade-500 text-white flex flex-col rounded-2xl shadow-xl">
        <div className="p-4 border-b border-jade-400 rounded-t-2xl">
          <Link href="/" className="flex items-center gap-2 text-jade-100 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-full min-h-[calc(100vh-2rem)] bg-jade-500 text-white flex flex-col rounded-2xl shadow-xl">
      <div className="p-4 border-b border-jade-400 rounded-t-2xl">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold">Isadora</span>
          <span className="text-jade-200 text-sm font-medium">Dashboard</span>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-jade-400 text-white"
                  : "text-jade-100 hover:bg-jade-400/50 hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={2} className="shrink-0" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-jade-400 rounded-b-2xl">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-jade-100 hover:bg-jade-400/50 hover:text-white transition-colors font-medium"
        >
          <LogOut size={20} strokeWidth={2} className="shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
