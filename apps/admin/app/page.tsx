import { redirect } from "next/navigation"
import { getAdminFromCookies } from "@/lib/admin-auth"

// Landing: send authenticated admins to the dashboard, everyone else to login.
export default async function AdminHome() {
  const admin = await getAdminFromCookies()
  redirect(admin ? "/dashboard" : "/login")
}
