import AdminShell from "@/components/navigation/AdminShell";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return <AdminShell>{children}</AdminShell>;
}
