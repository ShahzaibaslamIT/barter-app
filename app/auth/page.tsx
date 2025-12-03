


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
// import { AuthForm } from "@/components/auth/auth-form";
// import { Button } from "@/components/ui/button";

// export default function AuthPage() {
//   const [mode, setMode] = useState<"login" | "signup">("login");
//   const router = useRouter();

//   const handleAuthSuccess = (user: any, token: string) => {
//     if (!user || !token) {
//       console.warn("⚠️ Invalid login response:", { user, token });
//       return;
//     }

//     localStorage.setItem("auth_token", token);
//     localStorage.setItem("user", JSON.stringify(user));

//     console.log("✅ Logged in as:", user.username);

//     router.push("/home");
//   };

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

//         <AuthForm mode={mode} onSuccess={handleAuthSuccess} />

//         <div className="flex items-center my-4">
//           <div className="flex-grow h-px bg-muted" />
//           <span className="mx-2 text-sm text-muted-foreground">or</span>
//           <div className="flex-grow h-px bg-muted" />
//         </div>

//         <Button
//           variant="outline"
//           className="w-full"
//           onClick={() => signIn("google", { callbackUrl: "/home" })}
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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

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

        {/* ❗️ Removed onSuccess — frontend no longer handles login tokens here */}
        <AuthForm mode={mode} />

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-muted" />
          <span className="mx-2 text-sm text-muted-foreground">or</span>
          <div className="flex-grow h-px bg-muted" />
        </div>

        {/* Google Login */}
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
            className="text-sm"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
