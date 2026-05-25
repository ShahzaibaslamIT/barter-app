"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Trash2, SlidersHorizontal, Package, Wrench } from "lucide-react";
import { Suspense } from "react";

interface AdminListing {
  item_id: number;
  title: string;
  type: string;
  category: string;
  moderation_status: string;
  moderation_reason?: string;
  is_active: boolean;
  created_at: string;
  photos: string[];
  location_text?: string;
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

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/listings?${params}`);
    if (res.status === 401) { router.replace("/admin/login"); return; }
    const data = await res.json();
    setListings(data.listings || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, statusFilter, typeFilter, search, router]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const deleteListing = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this listing? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    if (res.ok) fetchListings();
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">Marketplace</p>
        <h1 className="text-3xl font-bold text-slate-900">Listings</h1>
        <p className="text-slate-500 mt-1">{total.toLocaleString()} total listings</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search listings…"
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
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="removed">Removed</option>
          <option value="needs_update">Needs Update</option>
          <option value="spam_flagged">Spam Flagged</option>
          <option value="blacklisted">Blacklisted</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
        >
          <option value="">All types</option>
          <option value="item">Items</option>
          <option value="service">Services</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {["Listing", "Type", "Status", "Owner", "Location", "Date", ""].map((h) => (
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
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <Package className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No listings found</p>
                </td>
              </tr>
            ) : (
              listings.map((l) => (
                <tr
                  key={l.item_id}
                  onClick={() => router.push(`/admin/listings/${l.item_id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {l.photos?.[0] ? (
                        <img src={l.photos[0]} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0 flex items-center justify-center">
                          <Package className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      <p className="font-medium text-slate-900 line-clamp-1">{l.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-slate-500 capitalize text-xs font-medium">
                      {l.type === "service" ? <Wrench className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
                      {l.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLES[l.moderation_status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {l.moderation_status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700 text-sm">{l.user.username}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{l.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{l.location_text || "—"}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => deleteListing(e, l.item_id)}
                      title="Permanently delete"
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default function ListingsPage() {
  return (
    <Suspense>
      <ListingsContent />
    </Suspense>
  );
}
