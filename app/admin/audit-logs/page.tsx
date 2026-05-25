"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ScrollText, Filter } from "lucide-react";

interface AuditLog {
  id: number;
  action_type: string;
  entity_type: string;
  entity_id: number;
  metadata: Record<string, unknown>;
  notes?: string;
  created_at: string;
  admin: { id: number; name: string; role: string };
}

const ENTITY_STYLES: Record<string, string> = {
  user:    "bg-blue-50 text-blue-700 border-blue-200",
  listing: "bg-violet-50 text-violet-700 border-violet-200",
  report:  "bg-orange-50 text-orange-700 border-orange-200",
};

const ACTION_COLOR: Record<string, string> = {
  approve:       "text-emerald-600",
  ban:           "text-red-600",
  suspend:       "text-amber-600",
  delete:        "text-red-700",
  blacklist:     "text-slate-900",
  remove:        "text-red-500",
  reject:        "text-orange-600",
  reactivate:    "text-emerald-600",
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLOR).find(k => action.includes(k));
  return key ? ACTION_COLOR[key] : "text-slate-700";
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (entityFilter) params.set("entity_type", entityFilter);

    const res = await fetch(`/api/admin/audit-logs?${params}`);
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, entityFilter, router]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">Security</p>
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-1">{total.toLocaleString()} total actions recorded</p>
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
        >
          <option value="">All entity types</option>
          <option value="user">User</option>
          <option value="listing">Listing</option>
          <option value="report">Report</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {["Action", "Entity", "Admin", "Date"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i}>
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <ScrollText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No audit logs yet</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className={`font-semibold capitalize text-sm ${getActionColor(log.action_type)}`}>
                      {log.action_type.replace(/_/g, " ")}
                    </p>
                    {log.notes && <p className="text-xs text-slate-400 mt-0.5">{log.notes}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${ENTITY_STYLES[log.entity_type] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {log.entity_type} #{log.entity_id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                        {log.admin.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{log.admin.name}</p>
                        <p className="text-[11px] text-slate-400 capitalize">{log.admin.role.replace("_", " ")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-slate-400">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-600">
              Previous
            </button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-600">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
