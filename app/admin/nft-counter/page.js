"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminNftCounterPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [series, setSeries] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) throw new Error("No admin token found");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (series) params.set("series", series);

      const res = await fetch(`/api/admin/nft-purchases?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to fetch" }));
        throw new Error(data.error || "Failed to fetch");
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, series]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">NFT Counter</h1>
          <button
            onClick={fetchData}
            className="px-3 py-2 text-sm rounded-md border"
            style={{ borderColor: "var(--default-border)", color: "#111827", background: "rgba(255,255,255,0.6)" }}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by memberId, email, name"
            className="px-3 py-2 rounded-md bg-transparent border text-gray-900 text-sm"
            style={{ borderColor: "var(--default-border)" }}
          />
          <select
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="px-3 py-2 rounded-md bg-transparent border text-gray-900 text-sm"
            style={{ borderColor: "var(--default-border)" }}
          >
            <option value="">All Series</option>
            {"ABCDEFGHIJ".split("").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
            className="px-3 py-2 rounded-md bg-transparent border text-gray-900 text-sm"
            style={{ borderColor: "var(--default-border)" }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <button
            onClick={() => setPage(1)}
            className="px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: "var(--default-border)", color: "#111827", background: "rgba(255,255,255,0.6)" }}
          >
            Apply Filters
          </button>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-auto" style={{ borderColor: "var(--default-border)" }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: "#374151" }}>
                <th className="px-4 py-2 border-b" style={{ borderColor: "var(--default-border)" }}>Purchased At</th>
                <th className="px-4 py-2 border-b" style={{ borderColor: "var(--default-border)" }}>Member ID</th>
                <th className="px-4 py-2 border-b" style={{ borderColor: "var(--default-border)" }}>User</th>
                <th className="px-4 py-2 border-b" style={{ borderColor: "var(--default-border)" }}>Email</th>
                <th className="px-4 py-2 border-b" style={{ borderColor: "var(--default-border)" }}>NFT Code</th>
                <th className="px-4 py-2 border-b" style={{ borderColor: "var(--default-border)" }}>Series</th>
              </tr>
            </thead>
            <tbody style={{ color: "#111827" }}>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No purchases found</td>
                </tr>
              )}
              {items.map((it) => (
                <tr key={`${it.userId}-${it.code}-${it.purchasedAt}`} className="hover:bg-white/5">
                  <td className="px-4 py-2 border-t" style={{ borderColor: "var(--default-border)" }}>{new Date(it.purchasedAt).toLocaleString()}</td>
                  <td className="px-4 py-2 border-t" style={{ borderColor: "var(--default-border)" }}>{it.user?.memberId || it.memberId || '-'}</td>
                  <td className="px-4 py-2 border-t" style={{ borderColor: "var(--default-border)" }}>{it.user?.name || '-'}</td>
                  <td className="px-4 py-2 border-t" style={{ borderColor: "var(--default-border)" }}>{it.user?.email || '-'}</td>
                  <td className="px-4 py-2 border-t" style={{ borderColor: "var(--default-border)" }}>{it.code}</td>
                  <td className="px-4 py-2 border-t" style={{ borderColor: "var(--default-border)" }}>{it.series}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>
          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-2 text-sm rounded-md border"
              style={{ borderColor: "var(--default-border)", color: "#fff", background: "rgba(255,255,255,0.06)" }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-2 text-sm rounded-md border"
              style={{ borderColor: "var(--default-border)", color: "#fff", background: "rgba(255,255,255,0.06)" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


