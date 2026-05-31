import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-auth";
import AdminSidebar from "@/components/AdminSidebar";

// Layout for every authenticated admin page. `/login` lives OUTSIDE this route
// group, so it stays public; everything inside (protected) requires a valid
// admin session. (Phase 7 adds middleware as defense-in-depth; this server-side
// guard is the primary gate for now.)
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar admin={admin} />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
