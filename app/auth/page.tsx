


// // "use client";

// // import { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { signIn } from "next-auth/react";
// // import { AuthForm } from "@/components/auth/auth-form";
// // import { Button } from "@/components/ui/button";

// // export default function AuthPage() {
// //   const [mode, setMode] = useState<"login" | "signup">("login");
// //   const router = useRouter();

// //   const handleAuthSuccess = (user: any, token: string) => {
// //     if (!user || !token) {
// //       console.warn("⚠️ Invalid login response:", { user, token });
// //       return;
// //     }

// //     localStorage.setItem("auth_token", token);
// //     localStorage.setItem("user", JSON.stringify(user));

// //     console.log("✅ Logged in as:", user.username);

// //     router.push("/home");
// //   };

// //   return (
// //     <div className="min-h-screen bg-background flex items-center justify-center p-4">
// //       <div className="w-full max-w-md space-y-6">
// //         <div className="text-center">
// //           <h1 className="font-serif text-3xl font-bold text-primary mb-2">
// //             BarterHub
// //           </h1>
// //           <p className="text-muted-foreground">
// //             Trade items and services in your community
// //           </p>
// //         </div>

// //         <AuthForm mode={mode} onSuccess={handleAuthSuccess} />

// //         <div className="flex items-center my-4">
// //           <div className="flex-grow h-px bg-muted" />
// //           <span className="mx-2 text-sm text-muted-foreground">or</span>
// //           <div className="flex-grow h-px bg-muted" />
// //         </div>

// //         <Button
// //           variant="outline"
// //           className="w-full"
// //           onClick={() => signIn("google", { callbackUrl: "/home" })}
// //         >
// //           Continue with Google
// //         </Button>

// //         <div className="text-center">
// //           <Button
// //             variant="ghost"
// //             className="text-sm"
// //             onClick={() => setMode(mode === "login" ? "signup" : "login")}
// //           >
// //             {mode === "login"
// //               ? "Don't have an account? Sign up"
// //               : "Already have an account? Sign in"}
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
// import { AuthForm } from "@/components/auth/auth-form";
// import { Button } from "@/components/ui/button";

// export default function AuthPage() {
//   const [mode, setMode] = useState<"login" | "signup">("login");
//   const router = useRouter();

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-6">
//         <div className="text-center">
//           <h1 className="font-serif text-3xl font-bold text-primary mb-2">
//             BarterHub
//           </h1>
//           <p className="text-muted-foreground">
//             Trade items and services in your community
//           </p>
//         </div>

//         {/* ❗️ Removed onSuccess — frontend no longer handles login tokens here */}
//         <AuthForm mode={mode} />

//         <div className="flex items-center my-4">
//           <div className="flex-grow h-px bg-muted" />
//           <span className="mx-2 text-sm text-muted-foreground">or</span>
//           <div className="flex-grow h-px bg-muted" />
//         </div>

//         {/* Google Login */}
//         <Button
//           variant="outline"
//           className="w-full"
//          onClick={() => signIn("google", { callbackUrl: "/auth/verify-otp" })}

//         >
//           Continue with Google
//         </Button>

//         <div className="text-center">
//           <Button
//             variant="ghost"
//             className="text-sm"
//             onClick={() => setMode(mode === "login" ? "signup" : "login")}
//           >
//             {mode === "login"
//               ? "Don't have an account? Sign up"
//               : "Already have an account? Sign in"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    // 🚫 VERY IMPORTANT: wait until session is resolved
    if (status === "loading") return;

    // ✅ Authenticated but OTP not verified → go to verify page
    if (
      status === "authenticated" &&
      (session as any)?.requires_verification
    ) {
      const email =
        (session as any)?.email ||
        (session as any)?.user?.email ||
        "";

      if (email) {
        router.replace(`/auth/verify?email=${encodeURIComponent(email)}`);
      }
      return;
    }

    // ✅ Fully authenticated → go home
  
  if (status === "authenticated") {
    router.replace("/home");
    return;
  }

    // ✅ If unauthenticated → STAY on auth page
  }, [status, session, router]);

  // ✅ While checking session, show nothing (or loader if you want)
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">
            BarterHub
          </h1>
          <p className="text-muted-foreground">
            Trade items and services in your community
          </p>
        </div>

        {/* Manual login / signup */}
        <AuthForm mode={mode} />

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-muted" />
          <span className="mx-2 text-sm text-muted-foreground">or</span>
          <div className="flex-grow h-px bg-muted" />
        </div>

  {/* Google login */}
  <Button
    variant="outline"
    className="w-full"
    onClick={() => signIn("google", { prompt: "select_account" })}
  >
    Continue with Google
  </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() =>
              setMode(mode === "login" ? "signup" : "login")
            }
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>

        {/* Admin portal link */}
        <Link
          href="/admin/login"
          className="group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 transition-all duration-200 overflow-hidden"
        >
          {/* Emerald glow strip on left */}
          <span className="absolute left-0 top-0 h-full w-1 bg-emerald-500 rounded-l-xl" />

          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0 ml-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </span>

          <span className="flex flex-col text-left">
            <span className="text-sm font-semibold text-white">Admin Portal</span>
            <span className="text-[11px] text-slate-400">Manage the platform</span>
          </span>

          <span className="ml-auto text-slate-500 group-hover:text-emerald-400 transition-colors text-lg">→</span>
        </Link>
      </div>
    </div>
  );
}
