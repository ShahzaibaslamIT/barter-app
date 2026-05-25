"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, ShieldBan, CheckCircle, XCircle, AlertTriangle, RefreshCw, Flag, MapPin, User, Calendar } from "lucide-react";

interface ListingDetail {
  item_id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  condition?: string;
  moderation_status: string;
  moderation_reason?: string;
  is_active: boolean;
  created_at: string;
  photos: string[];
  location_text?: string;
  barter_request?: string;
  user: { user_id: number; username: string; email: string };
}

const STATUS_STYLES: Record<string, string> = {
  approved:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  rejected:    "bg-red-50 text-red-700 border-red-200",
  removed:     "bg-slate-100 text-slate-500 border-slate-200",
  needs_update:"bg-blue-50 text-blue-700 border-blue-200",
  spam_flagged:"bg-orange-50 text-orange-700 border-orange-200",
  blacklisted: "bg-slate-900 text-white border-slate-700",
};

const REJECTION_REASONS = [
  "Inappropriate content",
  "Spam / duplicate",
  "Illegal item or service",
  "Scam risk",
  "Wrong category",
  "Missing required photo",
];

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/admin/listings/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setListing(d.listing))
      .catch((s) => { if (s === 401) router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [id, router]);

  const doAction = async (action: string) => {
    const finalReason = reason === "custom" ? customReason : reason;
    if (["reject", "remove", "blacklist"].includes(action) && !finalReason) {
      setMsg({ text: "Please select or enter a reason.", ok: false });
      return;
    }
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this listing?`)) return;

    setActionLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: finalReason }),
    });
    const data = await res.json();
    if (res.ok) {
      setListing(data.listing);
      setMsg({ text: `Listing ${action === "blacklist" ? "blacklisted" : action + "d"} successfully.`, ok: true });
    } else {
      setMsg({ text: data.error || "Action failed", ok: false });
    }
    setActionLoading(false);
  };

  const doDelete = async () => {
    if (!confirm("PERMANENTLY DELETE this listing? This cannot be undone.")) return;
    setActionLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.replace("/admin/listings");
    } else {
      const data = await res.json();
      setMsg({ text: data.error || "Delete failed", ok: false });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  if (!listing) return <div className="p-8 text-slate-400 text-sm">Listing not found.</div>;

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Listings
      </button>

      {/* Title row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">
            {listing.type} · {listing.category.replace(/_/g, " ")}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[listing.moderation_status] || "bg-slate-100 border-slate-200 text-slate-500"}`}>
          {listing.moderation_status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Photos */}
        <div className="space-y-3">
          {listing.photos.length > 0 ? (
            <>
              <img
                src={listing.photos[photoIdx]}
                alt={listing.title}
                className="w-full h-64 object-cover rounded-2xl border border-slate-200"
              />
              {listing.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {listing.photos.map((p, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)}>
                      <img
                        src={p}
                        alt=""
                        className={`h-14 w-14 rounded-xl object-cover border-2 transition-all ${i === photoIdx ? "border-emerald-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-64 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
              No photos uploaded
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Listing Details</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{listing.description}</p>
            {listing.barter_request && (
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-semibold mb-1">Looking for:</p>
                <p className="text-sm text-emerald-800">{listing.barter_request}</p>
              </div>
            )}
            <div className="divide-y divide-slate-100">
              {[
                { icon: RefreshCw, label: "Condition", value: listing.condition },
                { icon: MapPin, label: "Location", value: listing.location_text },
                { icon: Calendar, label: "Posted", value: new Date(listing.created_at).toLocaleDateString() },
              ].filter(({ value }) => value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2.5">
                  <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-400 w-20">{label}</span>
                  <span className="text-sm text-slate-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Owner</h2>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{listing.user.username}</p>
                <p className="text-xs text-slate-400">{listing.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/admin/users/${listing.user.user_id}`)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              View user profile →
            </button>
          </div>
        </div>
      </div>

      {/* Moderation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Moderation Actions</h2>

        {msg && (
          <div className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        {listing.moderation_reason && (
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            Reason on record: <span className="font-semibold text-slate-900 ml-1">{listing.moderation_reason}</span>
          </div>
        )}

        {/* Reason selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Reason <span className="text-slate-400 normal-case font-normal">(required for reject / remove / blacklist)</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-slate-700"
          >
            <option value="">— Select a reason —</option>
            {REJECTION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            <option value="custom">Custom reason…</option>
          </select>
          {reason === "custom" && (
            <input
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe the reason…"
              className="mt-2 border border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button onClick={() => doAction("approve")} disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-500/20">
            <CheckCircle className="h-4 w-4" /> Approve
          </button>
          <button onClick={() => doAction("reject")} disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-colors">
            <XCircle className="h-4 w-4" /> Reject
          </button>
          <button onClick={() => doAction("remove")} disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-400 disabled:opacity-50 transition-colors">
            <Trash2 className="h-4 w-4" /> Remove
          </button>
          <button onClick={() => doAction("needs_update")} disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-xl hover:bg-blue-400 disabled:opacity-50 transition-colors">
            <RefreshCw className="h-4 w-4" /> Needs Update
          </button>
          <button onClick={() => doAction("spam")} disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-400 disabled:opacity-50 transition-colors">
            <Flag className="h-4 w-4" /> Flag Spam
          </button>
        </div>
      </div>

      {/* Regulatory — destructive zone */}
      <div className="bg-white border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldBan className="h-4 w-4 text-red-500" />
          <h2 className="text-xs font-semibold text-red-600 uppercase tracking-widest">Regulatory Actions</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">Permanent or severe — use with extreme caution.</p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => doAction("blacklist")}
            disabled={actionLoading || listing.moderation_status === "blacklisted"}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <ShieldBan className="h-4 w-4" />
            Blacklist Listing
          </button>
          <button
            onClick={doDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Permanently Delete
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-600">Blacklist</strong> — permanently bans the listing from the marketplace (requires reason above).<br />
          <strong className="text-slate-600">Delete</strong> — hard-deletes the record from the database. Irreversible. Super admin only.
        </p>
      </div>
    </div>
  );
}
