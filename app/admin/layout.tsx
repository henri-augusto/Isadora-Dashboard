import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminLayoutWrapper } from "@/components/AdminLayoutWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return <AdminLayoutWrapper session={session}>{children}</AdminLayoutWrapper>;
}
