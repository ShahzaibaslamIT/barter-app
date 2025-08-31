"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const router = useRouter()

  const handleAuthSuccess = (user: any, token: string) => {
    // Store token in localStorage
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user", JSON.stringify(user))

    // Redirect to home page
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">BarterHub</h1>
          <p className="text-muted-foreground">Trade items and services with your local community</p>
        </div>

        <AuthForm mode={mode} onSuccess={handleAuthSuccess} />

        <div className="text-center">
          <Button variant="ghost" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm">
            {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}
