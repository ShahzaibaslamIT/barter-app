"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Checks if the logged-in user has accepted terms.
 * If not, redirects to /accept-terms.
 * Safe to call in any client component — no hydration issues.
 */
export function useTermsGate() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) return; // not logged in, skip
        if (data.user.terms_accepted === false) {
          router.replace("/accept-terms");
        }
      })
      .catch(() => {});
  }, [router]);
}
