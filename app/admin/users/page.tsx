"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, UserX, ShieldOff, UserCheck, Users, AlertTriangle, Ban } from "lucide-react";

interface AdminUser {
  user_id: number;
  username: string;
  email: string;
  user_type: string;
  status: string;
  city?: string;
  country?: string;
  created_at: string;
  email_verified: boolean;
  _count: { listings: number; offersMade: number; reports_made: number };
}

const STATUS_STYLES: Record<string, string> = {
  active:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended:   "bg-amber-50 text-amber-700 border-amber-200",
  warned:      "bg-orange-50 text-orange-700 border-orange-200",
  blacklisted: "bg-purple-50 text-purple-700 border-purple-200",
  banned:      "bg-red-50 text-red-700 border-red-200",
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/users?${params}`);
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, search, statusFilter, router]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const quickAction = async (e: React.MouseEvent, userId: number, action: string) => {
    e.stopPropagation();
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this user?`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) fetchUsers();
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">People</p>
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">{total.toLocaleString()} registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 transition-colors font-medium">
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="warned">Warned</option>
          <option value="suspended">Suspended</option>
          <option value="blacklisted">Blacklisted</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {["User", "Status", "Type", "Location", "Listings", "Joined", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.user_id}
                  onClick={() => router.push(`/admin/users/${u.user_id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500">
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.username}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLES[u.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs capitalize">{u.user_type.replace("_", " ")}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{[u.city, u.country].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-700">{u._count.listings}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {u.status !== "active" && (
                        <button
                          onClick={(e) => quickAction(e, u.user_id, "reactivate")}
                          title="Reactivate"
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      {u.status !== "banned" && (
                        <>
                          <button
                            onClick={(e) => quickAction(e, u.user_id, "warn")}
                            title="Warn"
                            className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                          {u.status !== "suspended" && (
                            <button
                              onClick={(e) => quickAction(e, u.user_id, "suspend")}
                              title="Suspend (30 days)"
                              className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <ShieldOff className="h-4 w-4" />
                            </button>
                          )}
                          {u.status !== "blacklisted" && (
                            <button
                              onClick={(e) => quickAction(e, u.user_id, "blacklist")}
                              title="Blacklist (15 days)"
                              className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => quickAction(e, u.user_id, "ban")}
                            title="Ban permanently"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-slate-400">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-600"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
