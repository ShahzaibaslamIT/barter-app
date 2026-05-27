"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type StatusPayload = {
  status?: "active" | "suspended" | "warned" | "banned" | "blacklisted";
  suspension_reason?: string | null;
  suspended_until?: string | null;
  blacklist_reason?: string | null;
  blacklisted_until?: string | null;
  warning_count?: number | null;
};

const POLL_MS = 60_000;

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function StatusBanner() {
  const pathname = usePathname();
  const [data, setData] = useState<StatusPayload | null>(null);

  useEffect(() => {
    // Don't poll on the auth screens — the user isn't authenticated there
    // and /api/user/me would 401.
    if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) return;

    let cancelled = false;
    const fetchOnce = async () => {
      try {
        const res = await fetch("/api/user/me", { cache: "no-store" });
        if (!res.ok) return; // 401 (logged out) — nothing to show
        const json = await res.json();
        if (!cancelled) setData(json?.user ?? null);
      } catch {
        // network blip — ignore, next poll will retry
      }
    };

    fetchOnce();
    const interval = setInterval(fetchOnce, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  if (!data || !data.status || data.status === "active") return null;

  let color = "bg-yellow-600";
  let title = "";
  let body: string | null = null;

  if (data.status === "warned") {
    color = "bg-yellow-600";
    title = `You have received a warning${data.warning_count ? ` (${data.warning_count} total)` : ""}.`;
    body = "Further violations may lead to suspension or removal of your account.";
  } else if (data.status === "suspended") {
    const days = daysUntil(data.suspended_until);
    color = "bg-red-700";
    title = "Your account is suspended.";
    body = `${data.suspension_reason ? data.suspension_reason + ". " : ""}${
      days != null ? `${days} day${days === 1 ? "" : "s"} remaining.` : "Contact support."
    }`;
  } else if (data.status === "blacklisted") {
    const days = daysUntil(data.blacklisted_until);
    color = "bg-red-700";
    title = "Your account is blacklisted.";
    body = `${data.blacklist_reason ? data.blacklist_reason + ". " : ""}${
      days != null ? `${days} day${days === 1 ? "" : "s"} remaining.` : "Contact support."
    }`;
  } else if (data.status === "banned") {
    color = "bg-red-800";
    title = "Your account has been permanently banned.";
    body = "Contact support if you believe this is a mistake.";
  }

  return (
    <div
      role="alert"
      className={`${color} text-white text-sm px-4 py-2 text-center sticky top-0 z-50 shadow`}
    >
      <strong>{title}</strong>
      {body ? <span className="ml-2">{body}</span> : null}
    </div>
  );
}
