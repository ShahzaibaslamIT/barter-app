"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, ListChecks, Flag,
  ScrollText, LogOut, ChevronRight, Zap, Menu, X,
} from "lucide-react";

interface AdminInfo {
  admin_id: number;
  email: string;
  name: string;
  role: string;
}

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users",     label: "Users",     icon: Users },
  { href: "/admin/listings",  label: "Listings",  icon: ListChecks },
  { href: "/admin/reports",   label: "Reports",   icon: Flag },
  { href: "/admin/audit-logs",label: "Audit Logs",icon: ScrollText },
];

export default function AdminSidebar({ admin }: { admin: AdminInfo }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const initials = admin.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-none">BarterHub</p>
            <p className="text-[10px] text-emerald-400 mt-0.5 tracking-widest uppercase">Admin Console</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-3">Navigation</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 text-emerald-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Admin profile */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{admin.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{admin.role.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile top header ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">BarterHub</span>
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Admin</span>
        </div>
      </header>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-950 flex flex-col shrink-0 border-r border-slate-800
          transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
