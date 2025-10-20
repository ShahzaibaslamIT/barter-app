// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { AuthForm } from "@/components/auth/auth-form"
// import { Button } from "@/components/ui/button"

// export default function AuthPage() {
//   const [mode, setMode] = useState<"login" | "signup">("login")
//   const router = useRouter()

//   const handleAuthSuccess = (user: any, token: string) => {
//     // ✅ Store token & user securely
//     localStorage.setItem("auth_token", token)
//     localStorage.setItem("user", JSON.stringify(user))

//     // Optional: set a flag so API calls can read it
//     console.log("✅ Logged in as", user.username, "with token:", token)

//     // ✅ Redirect to home page
//     router.push("/")
//   }

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-6">
//         <div className="text-center">
//           <h1 className="font-serif text-3xl font-bold text-primary mb-2">BarterHub</h1>
//           <p className="text-muted-foreground">
//             Trade items and services with your local community
//           </p>
//         </div>

//         {/* Auth form triggers login/signup */}
//         <AuthForm mode={mode} onSuccess={handleAuthSuccess} />

//         <div className="text-center">
//           <Button
//             variant="ghost"
//             onClick={() => setMode(mode === "login" ? "signup" : "login")}
//             className="text-sm"
//           >
//             {mode === "login"
//               ? "Don't have an account? Sign up"
//               : "Already have an account? Sign in"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { AuthForm } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const router = useRouter()

  // ✅ This is used for email/password auth only
  const handleAuthSuccess = (user: any, token: string) => {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user", JSON.stringify(user))

    console.log("✅ Logged in as", user.username, "with token:", token)

    router.push("/home") // ✅ redirect after login/signup
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">
            BarterHub
          </h1>
          <p className="text-muted-foreground">
            Trade items and services with your local community
          </p>
        </div>

        {/* Email/Password login/signup */}
        <AuthForm mode={mode} onSuccess={handleAuthSuccess} />

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-muted" />
          <span className="mx-2 text-sm text-muted-foreground">or</span>
          <div className="flex-grow h-px bg-muted" />
        </div>

        {/* Google login (NextAuth) */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/home" })}
        >
          Continue with Google
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}
