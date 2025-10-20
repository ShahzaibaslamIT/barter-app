// app/page.tsx
import { redirect } from "next/navigation"

export default function IndexPage() {
  redirect("/auth")   // ✅ default route goes to auth
}
