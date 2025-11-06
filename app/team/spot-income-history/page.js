"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SpotIncomeHistoryPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || Number.isNaN(amount)) return "-";
    const num = typeof amount === "number" ? amount : parseFloat(String(amount));
    if (!Number.isFinite(num)) return "-";
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const normalizeEntries = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((it) => {
      const amount = it.amount ?? it.value ?? it.commissionAmount ?? it.credit ?? 0;
      const date = it.date ?? it.createdAt ?? it.time ?? it.timestamp ?? null;
      const from = it.from || it.sender || it.referral || it.user || {};
      const memberId = from.memberId || from.id || it.fromMemberId || it.senderId || '-';
      const name = from.name || it.fromName || it.senderName || '-';
      const note = it.note || it.reason || it.description || it.remark || '';
      return {
        from: { name, memberId },
        amount: typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]/g, '')) || 0,
        date,
        note,
      };
    }).filter(e => Number.isFinite(e.amount));
  };

  const fetchSpotIncome = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const candidateUrls = [
        "/api/spot-income-history",
        "/api/team/spot-income-history",
        "/api/spot-income"
      ];

      let success = false;
      for (const url of candidateUrls) {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setEntries(Array.isArray(data?.history) ? data.history : (Array.isArray(data) ? data : []));
          success = true;
          break;
        }
      }

      // Fallback: try wallet balance for spot-related transactions
      if (!success) {
        const balRes = await fetch('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` } });
        if (balRes.ok) {
          const bal = await balRes.json();
          const candidates = [
            bal?.spotIncomeHistory,
            bal?.history,
            bal?.transactions,
            bal?.spotIncome?.history
          ];
          let list = [];
          for (const c of candidates) {
            if (Array.isArray(c)) { list = c; break; }
          }
          // Filter to spot income if mixed types
          const filtered = Array.isArray(list) ? list.filter(tx => {
            const t = (tx.type || tx.category || tx.kind || '').toString().toLowerCase();
            return t.includes('spot') || t.includes('referral') || t.includes('sponsor');
          }) : [];
          const normalized = normalizeEntries(filtered.length ? filtered : list);
          if (normalized.length) {
            setEntries(normalized);
            success = true;
          }
        }
      }

      // Fallback: try dashboard for embedded spot income history
      if (!success) {
        const dashRes = await fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        if (dashRes.ok) {
          const dash = await dashRes.json();
          const historyCandidates = [
            dash?.spotIncomeHistory,
            dash?.spotIncome?.history,
            dash?.income?.spot?.history,
            dash?.spotIncomeDetails
          ];
          const found = historyCandidates.find(Array.isArray);
          if (Array.isArray(found)) {
            setEntries(normalizeEntries(found));
            success = true;
          }
          // As a last resort, if we only have totals, show a synthetic summary row
          if (!success && (dash?.totalSpotIncome || dash?.incomeStats?.totalSpotIncome)) {
            const total = dash?.totalSpotIncome || dash?.incomeStats?.totalSpotIncome;
            const amt = typeof total === 'number' ? total : parseFloat(String(total).replace(/[^0-9.-]/g, '')) || 0;
            if (amt > 0) {
              setEntries([{
                from: { name: 'Multiple Sources', memberId: '-' },
                amount: amt,
                date: null,
                note: 'Summary from dashboard total. Detailed history endpoint unavailable.'
              }]);
              success = true;
            }
          }
        }
      }

      if (!success) {
        setEntries([]);
      }
    } catch (err) {
      console.error("Error fetching spot income history:", err);
      setError(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSpotIncome();
  }, [fetchSpotIncome]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-xl">Loading spot income history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced">Spot Income History</h1>
          <p className="text-gray-300">See who generated your spot income and when</p>
          <div className="mt-4">
            <button
              onClick={fetchSpotIncome}
              className="btn-enhanced px-4 py-2 text-white hover-bounce text-sm flex items-center space-x-2 mx-auto"
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>{loading ? '⟳' : '↻'}</span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="card-enhanced rounded-2xl p-6 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{background: 'linear-gradient(to right, rgba(29, 68, 67, 0.8), rgba(29, 68, 67, 0.8))', borderBottom: '1px solid var(--default-border)'}}>
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">From</th>
                  <th className="px-6 py-4 text-white font-semibold">Member ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Amount</th>
                  <th className="px-6 py-4 text-white font-semibold">Date</th>
                  <th className="px-6 py-4 text-white font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item, index) => (
                  <tr key={`${item?.id || index}`} className="transition-colors duration-200 hover:bg-opacity-20" style={{
                    borderBottom: '1px solid var(--default-border)',
                    backgroundColor: 'rgba(29, 68, 67, 0.1)'
                  }}>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{index + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{item?.from?.name || "Unknown"}</td>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{item?.from?.memberId || "-"}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>{formatCurrency(item?.amount)}</td>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{formatDate(item?.date)}</td>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{item?.note || item?.reason || '-'}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center" colSpan={6} style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                      No spot income history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


