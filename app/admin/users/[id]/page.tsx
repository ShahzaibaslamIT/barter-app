"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, ShieldOff, UserX, MapPin, Calendar, Mail, Package, Star } from "lucide-react";

import { AlertTriangle, Ban, Clock } from "lucide-react";

interface UserDetail {
  user_id: number;
  username: string;
  email: string;
  user_type: string;
  status: string;
  city?: string;
  country?: string;
  created_at: string;
  email_verified: boolean;
  admin_notes?: string;
  suspension_reason?: string;
  suspended_until?: string;
  warning_count?: number;
  blacklisted_until?: string;
  blacklist_reason?: string;
  _count: { listings: number; offersMade: number; reports_made: number; ratingsReceived: number };
}

const STATUS_STYLES: Record<string, string> = {
  active:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended:   "bg-amber-50 text-amber-700 border-amber-200",
  warned:      "bg-orange-50 text-orange-700 border-orange-200",
  blacklisted: "bg-purple-50 text-purple-700 border-purple-200",
  banned:      "bg-red-50 text-red-700 border-red-200",
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { setUser(d.user); setAdminNotes(d.user.admin_notes || ""); })
      .catch((s) => { if (s === 401) router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [id, router]);

  const doAction = async (action: string, extra: Record<string, unknown> = {}) => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    setActionLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setMsg({ text: `User ${action} successful.`, ok: true });
    } else {
      setMsg({ text: data.error || "Action failed", ok: false });
    }
    setActionLoading(false);
  };

  const saveNotes = async () => {
    setActionLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_notes: adminNotes }),
    });
    setMsg({ text: res.ok ? "Notes saved." : "Failed to save notes.", ok: res.ok });
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl">
        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }
  if (!user) return <div className="p-8 text-slate-400 text-sm">User not found.</div>;

  const initials = user.username.slice(0, 2).toUpperCase();
  const location = [user.city, user.country].filter(Boolean).join(", ");

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </button>

      {/* Profile header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
              <span className="text-white text-lg sm:text-xl font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{user.username}</h1>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs sm:text-sm mt-0.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[user.status] || "bg-slate-100 border-slate-200 text-slate-500"}`}>
            {user.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Profile info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Profile</h2>
          <div className="space-y-3">
            {[
              { icon: Package, label: "User type", value: user.user_type?.replace("_", " ") },
              { icon: MapPin, label: "Location", value: location || "—" },
              { icon: Calendar, label: "Joined", value: new Date(user.created_at).toLocaleDateString() },
              { icon: Mail, label: "Verified", value: user.email_verified ? "Yes" : "No" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-400 w-20">{label}</span>
                <span className="text-sm font-medium text-slate-900 capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity stats */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Listings", value: user._count.listings, icon: Package, color: "text-emerald-500" },
              { label: "Offers Made", value: user._count.offersMade, icon: ArrowLeft, color: "text-blue-500" },
              { label: "Reports", value: user._count.reports_made, icon: ShieldOff, color: "text-orange-500" },
              { label: "Ratings", value: user._count.ratingsReceived, icon: Star, color: "text-amber-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <Icon className={`h-4 w-4 ${color} mb-2`} />
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Internal Notes</h2>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none text-slate-700 placeholder-slate-400"
          placeholder="Add internal notes about this user…"
        />
        <button
          onClick={saveNotes}
          disabled={actionLoading}
          className="mt-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium"
        >
          Save Notes
        </button>
      </div>

      {/* Status Details */}
      {(user.warning_count ?? 0) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h2 className="text-sm font-semibold text-orange-700">Warning History</h2>
          </div>
          <p className="text-sm text-orange-600">
            This user has <span className="font-bold">{user.warning_count}</span> warning(s) on record.
            {(user.warning_count ?? 0) >= 2 && " Consider banning on next violation."}
          </p>
        </div>
      )}

      {user.suspended_until && user.status === "suspended" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-700">
              Suspended until <span className="font-bold">{new Date(user.suspended_until).toLocaleDateString()}</span>
              {user.suspension_reason && <> — {user.suspension_reason}</>}
            </p>
          </div>
        </div>
      )}

      {user.blacklisted_until && user.status === "blacklisted" && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-purple-600" />
            <p className="text-sm text-purple-700">
              Blacklisted until <span className="font-bold">{new Date(user.blacklisted_until).toLocaleDateString()}</span>
              {user.blacklist_reason && <> — {user.blacklist_reason}</>}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Admin Actions</h2>

        {msg && (
          <div className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.text}
          </div>
        )}

        {/* Reason input — always visible */}
        <input
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="Reason (optional)"
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full mb-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />

        {/* Reactivate — shown for any non-active status */}
        {user.status !== "active" && (
          <button
            onClick={() => doAction("reactivate")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors mb-4"
          >
            <UserCheck className="h-4 w-4" /> Reactivate Account
          </button>
        )}

        {/* Action buttons grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
          {/* Warn */}
          {user.status !== "banned" && (
            <button
              onClick={() => doAction("warn", { suspension_reason: suspendReason })}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-400 disabled:opacity-50 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" /> Issue Warning
            </button>
          )}

          {/* Suspend (30 days default) */}
          {user.status !== "banned" && user.status !== "suspended" && (
            <button
              onClick={() => doAction("suspend", { suspension_reason: suspendReason })}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              <ShieldOff className="h-4 w-4" /> Suspend (30 days)
            </button>
          )}

          {/* Blacklist (15 days default) */}
          {user.status !== "banned" && user.status !== "blacklisted" && (
            <button
              onClick={() => doAction("blacklist", { suspension_reason: suspendReason, blacklist_days: 15 })}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              <Ban className="h-4 w-4" /> Blacklist (15 days)
            </button>
          )}

          {/* Ban — permanent */}
          {user.status !== "banned" && (
            <button
              onClick={() => doAction("ban", { suspension_reason: suspendReason })}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              <UserX className="h-4 w-4" /> Ban Permanently
            </button>
          )}
        </div>

        {/* Escalation guide */}
        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Escalation Flow</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">Warning</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">Suspend 30d</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Blacklist 15d</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">Ban</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Suspensions & blacklists auto-expire. User receives a warning upon expiry. After repeated warnings, escalate to ban.
          </p>
        </div>

        {user.suspension_reason && (
          <p className="mt-3 text-sm text-slate-400">
            Reason on record: <span className="font-semibold text-slate-900">{user.suspension_reason}</span>
          </p>
        )}
      </div>
    </div>
  );
}
