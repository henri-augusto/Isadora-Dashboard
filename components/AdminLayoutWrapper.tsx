"use client";

import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { AdminNav } from "./AdminNav";

export function AdminLayoutWrapper({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex p-4 gap-4">
      <div className="shrink-0 self-stretch">
        <AdminNav session={session} />
      </div>
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
