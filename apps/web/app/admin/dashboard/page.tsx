"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ListChecks, ArrowUpRight, Flag, ShoppingBag, TrendingUp, AlertCircle } from "lucide-react";

interface Stats {
  users: { new_24h: number; new_7d: number; total: number };
  listings: { active: number; pending_review: number; total: number };
  offers: { today: number; total: number };
  reports: { open: number };
}

const STAT_CONFIG = [
  {
    key: "users",
    label: "Total Users",
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-500",
    icon: Users,
    getValue: (s: Stats) => s.users.total.toLocaleString(),
    getSub: (s: Stats) => `+${s.users.new_24h} today · +${s.users.new_7d} this week`,
    href: "/admin/users",
  },
  {
    key: "listings",
    label: "Active Listings",
    color: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-500",
    icon: ShoppingBag,
    getValue: (s: Stats) => s.listings.active.toLocaleString(),
    getSub: (s: Stats) => `${s.listings.total} total in database`,
    href: "/admin/listings",
  },
  {
    key: "pending",
    label: "Pending Review",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500",
    icon: ListChecks,
    getValue: (s: Stats) => s.listings.pending_review,
    getSub: () => "Listings awaiting moderation",
    href: "/admin/listings?status=pending",
    alert: (s: Stats) => s.listings.pending_review > 0,
  },
  {
    key: "offers",
    label: "Barter Offers",
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500",
    icon: TrendingUp,
    getValue: (s: Stats) => s.offers.total.toLocaleString(),
    getSub: (s: Stats) => `${s.offers.today} created today`,
    href: null,
  },
  {
    key: "reports",
    label: "Open Reports",
    color: "from-rose-500 to-red-600",
    iconBg: "bg-rose-500",
    icon: Flag,
    getValue: (s: Stats) => s.reports.open,
    getSub: () => "Require attention",
    href: "/admin/reports?status=open",
    alert: (s: Stats) => s.reports.open > 0,
  },
];

const QUICK_LINKS = [
  { label: "Review Pending", href: "/admin/listings?status=pending", color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" },
  { label: "Open Reports", href: "/admin/reports?status=open", color: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100" },
  { label: "Manage Users", href: "/admin/users", color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" },
  { label: "Audit Logs", href: "/admin/audit-logs", color: "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setStats)
      .catch((s) => { if (s === 401) router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">{today}</p>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Your marketplace at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            ))
          : stats && STAT_CONFIG.map((cfg) => {
              const isAlert = cfg.alert?.(stats);
              const href = cfg.href;
              const card = (
                <div
                  key={cfg.key}
                  className={`bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 ${
                    isAlert
                      ? "border-amber-300 shadow-sm shadow-amber-100"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  } ${href ? "cursor-pointer" : ""}`}
                  onClick={href ? () => router.push(href) : undefined}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">{cfg.label}</p>
                    <div className={`h-9 w-9 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
                      <cfg.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{cfg.getValue(stats)}</p>
                    <p className="text-xs text-slate-400 mt-1">{cfg.getSub(stats)}</p>
                  </div>
                  {isAlert && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Needs attention
                    </div>
                  )}
                </div>
              );
              return card;
            })}
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {QUICK_LINKS.map(({ label, href, color }) => (
            <a
              key={href}
              href={href}
              className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${color}`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
