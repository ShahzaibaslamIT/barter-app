"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Pages that should NOT trigger terms redirect
const EXCLUDED_PATHS = [
  "/accept-terms",
  "/auth",
  "/admin",
  "/complete-profile",
  "/api",
];

/**
 * Checks if logged-in user has accepted terms. If not, redirects to /accept-terms.
 */
export default function TermsGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check on excluded pages
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    fetch("/api/user/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user && data.user.terms_accepted === false) {
          router.replace("/accept-terms");
        }
      })
      .catch(() => {});
  }, [router, pathname]);

  return null;
}
