import { redirect } from "next/navigation"

// Skeleton landing. Finalized in T074 to redirect to /dashboard when an admin
// session exists, or /login otherwise. For now the only real entry point is
// /login (moved into this app in stage 2).
export default function AdminHome() {
  redirect("/login")
}
