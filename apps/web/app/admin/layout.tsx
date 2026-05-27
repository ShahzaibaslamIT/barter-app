import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Login page lives inside /admin but must be publicly accessible
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  // All other /admin/* routes require a valid admin session
  const admin = await getAdminFromCookies();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar admin={admin} />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
