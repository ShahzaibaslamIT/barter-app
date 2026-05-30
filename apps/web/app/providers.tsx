// "use client"

// import { SessionProvider } from "next-auth/react"
// import type { ReactNode } from "react"

// export function Providers({ children }: { children: ReactNode }) {
//   return <SessionProvider>{children}</SessionProvider>
// }


"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@barter/ui";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
