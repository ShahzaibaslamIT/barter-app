"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Report {
  id: number;
  reported_type: string;
  reported_entity_id: number;
  reason: string;
  status: string;
  outcome?: string;
  created_at: string;
  reporter: { user_id: number; username: string; email: string };
  resolved_by?: { id: number; name: string };
}

const STATUS_BADGE: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  in_review: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const OUTCOMES = [
  { value: "no_action", label: "No action" },
  { value: "listing_removed", label: "Listing removed" },
  { value: "user_warned", label: "User warned" },
  { value: "user_suspended", label: "User suspended" },
  { value: "user_banned", label: "User banned" },
];

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("open");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<number | null>(null);
  const [outcome, setOutcome] = useState("no_action");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);

    const res = await fetch(`/api/admin/reports?${params}`);
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const data = await res.json();
    setReports(data.reports || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, statusFilter, typeFilter, router]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleResolve = async (reportId: number) => {
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved", outcome, notes }),
    });
    if (res.ok) {
      setMsg("Report resolved.");
      setResolving(null);
      setNotes("");
      fetchReports();
    } else {
      setMsg("Failed to resolve report.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} reports</p>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg">
          {msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All types</option>
          <option value="listing">Listing</option>
          <option value="user">User</option>
          <option value="message">Message</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : reports.length === 0 ? (
          <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
            No reports found
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[r.status] || "bg-gray-100"}`}>
                      {r.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-400 capitalize border rounded-full px-2 py-0.5">
                      {r.reported_type} #{r.reported_entity_id}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{r.reason}</p>
                  <p className="text-xs text-gray-400">
                    Reported by <span className="font-medium text-gray-700">{r.reporter.username}</span>
                    {" · "}{new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.resolved_by && (
                    <p className="text-xs text-gray-400">Resolved by {r.resolved_by.name}</p>
                  )}
                  {r.outcome && (
                    <p className="text-xs text-gray-500">Outcome: <span className="capitalize font-medium">{r.outcome.replace(/_/g, " ")}</span></p>
                  )}
                </div>

                {r.status === "open" && (
                  <button
                    onClick={() => setResolving(resolving === r.id ? null : r.id)}
                    className="shrink-0 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Resolve
                  </button>
                )}
              </div>

              {resolving === r.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                    <select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none w-full max-w-xs"
                    >
                      {OUTCOMES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none resize-none"
                      placeholder="Add a resolution note…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(r.id)}
                      className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
                    >
                      Confirm Resolve
                    </button>
                    <button
                      onClick={() => setResolving(null)}
                      className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Previous
            </button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
