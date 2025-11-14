"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SpotIncomeHistoryPage() {
  const { token } = useAuth();
  const [spotIncomeData, setSpotIncomeData] = useState(null);
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

  const fetchSpotIncome = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      
      // Call the spot-income-history API
      const res = await fetch("/api/spot-income-history", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Spot income data received:", data);
        setSpotIncomeData(data);
        return;
      }

      console.error("Spot income API failed with status:", res.status);
      setSpotIncomeData(null);
    } catch (err) {
      console.error("Error fetching spot income history:", err);
      setError(err.message || "Failed to fetch spot income data");
      setSpotIncomeData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSpotIncome();
  }, [fetchSpotIncome]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#1565c0] text-xl">Loading spot income history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  // Group entries by level
  const groupedByLevel = {
    1: [],
    2: [],
    3: []
  };

  if (spotIncomeData?.spotIncomeHistory && Array.isArray(spotIncomeData.spotIncomeHistory)) {
    spotIncomeData.spotIncomeHistory.forEach(entry => {
      const level = entry.level || 1;
      if (groupedByLevel[level]) {
        groupedByLevel[level].push(entry);
      }
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#1565c0] mb-2">Spot Income History</h1>
          <p className="text-[#1565c0]/80">See spot income from L1, L2, and L3 referrals and when they purchased NFTs</p>
          <div className="mt-4">
            <button
              onClick={fetchSpotIncome}
              className="px-4 py-2 rounded bg-[#1565c0] text-white font-semibold text-sm flex items-center space-x-2 mx-auto"
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>{loading ? '⟳' : '↻'}</span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {spotIncomeData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-xl p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {spotIncomeData.summary.totalEntries}
                </div>
                <div className="text-sm text-white/80">Total Entries</div>
              </div>
            </div>
            <div className="rounded-xl p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(spotIncomeData.summary.totalSpotIncome)}
                </div>
                <div className="text-sm text-white/80">Total Spot Income</div>
              </div>
            </div>
            <div className="rounded-xl p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-sm font-semibold text-white/80 mb-1">Level 1</div>
                <div className="text-xl font-bold text-white mb-1">
                  {spotIncomeData.summary.levelSummaries?.L1?.count || 0}
                </div>
                <div className="text-xs text-white/80">{formatCurrency(spotIncomeData.summary.levelSummaries?.L1?.total || 0)}</div>
              </div>
            </div>
            <div className="rounded-xl p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-sm font-semibold text-white/80 mb-1">L2 + L3</div>
                <div className="text-xl font-bold text-white mb-1">
                  {(spotIncomeData.summary.levelSummaries?.L2?.count || 0) + (spotIncomeData.summary.levelSummaries?.L3?.count || 0)}
                </div>
                <div className="text-xs text-white/80">
                  {formatCurrency((spotIncomeData.summary.levelSummaries?.L2?.total || 0) + (spotIncomeData.summary.levelSummaries?.L3?.total || 0))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spot Income Entries by Level */}
        <div className="rounded-2xl p-6 shadow-lg" style={{background:'#1565c0', color:'#fff'}}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead style={{background:'#1565c0'}}>
                <tr>
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">Level</th>
                  <th className="px-6 py-4 text-white font-semibold">Referral Name</th>
                  <th className="px-6 py-4 text-white font-semibold">Member ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Spot Income</th>
                  <th className="px-6 py-4 text-white font-semibold">NFT Code</th>
                  <th className="px-6 py-4 text-white font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {spotIncomeData?.spotIncomeHistory && spotIncomeData.spotIncomeHistory.length > 0 ? (
                  spotIncomeData.spotIncomeHistory.map((item, index) => (
                    <tr key={`${item?.nftPurchaseId || index}`} className="transition-colors duration-200 hover:bg-white/10" style={{
                      borderBottom: '1px solid #fff',
                      backgroundColor: '#1565c0'
                    }}>
                      <td className="px-6 py-4 text-white/80">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1565c0] border border-[#1565c0]">
                          L{item.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{item?.referral?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-white/80">{item?.referral?.memberId || "-"}</td>
                      <td className="px-6 py-4 font-medium text-white">{formatCurrency(item?.spotIncome)}</td>
                      <td className="px-6 py-4 text-white/80">
                        <span className="text-xs font-mono">{item?.nftCode || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-white/80">{formatDate(item?.purchaseDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center text-white/80" colSpan={7}>
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


