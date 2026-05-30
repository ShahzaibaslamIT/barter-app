"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@barter/ui"

export function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Checking session…</p>
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm">Hi, {session.user.name || session.user.email}</p>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" onClick={() => signIn("google")}>
      Sign in with Google
    </Button>
  )
}
