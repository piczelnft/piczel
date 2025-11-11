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
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced">Spot Income History</h1>
          <p className="text-gray-300">See spot income from L1, L2, and L3 referrals and when they purchased NFTs</p>
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

        {/* Summary Cards */}
        {spotIncomeData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {spotIncomeData.summary.totalEntries}
                </div>
                <div className="text-sm text-gray-300">Total Entries</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(spotIncomeData.summary.totalSpotIncome)}
                </div>
                <div className="text-sm text-gray-300">Total Spot Income</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-sm font-semibold text-emerald-300 mb-1">Level 1</div>
                <div className="text-xl font-bold text-green-400 mb-1">
                  {spotIncomeData.summary.levelSummaries?.L1?.count || 0}
                </div>
                <div className="text-xs text-gray-400">{formatCurrency(spotIncomeData.summary.levelSummaries?.L1?.total || 0)}</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-sm font-semibold text-emerald-300 mb-1">L2 + L3</div>
                <div className="text-xl font-bold text-green-400 mb-1">
                  {(spotIncomeData.summary.levelSummaries?.L2?.count || 0) + (spotIncomeData.summary.levelSummaries?.L3?.count || 0)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatCurrency((spotIncomeData.summary.levelSummaries?.L2?.total || 0) + (spotIncomeData.summary.levelSummaries?.L3?.total || 0))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spot Income Entries by Level */}
        <div className="card-enhanced rounded-2xl p-6 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{background: 'linear-gradient(to right, rgba(29, 68, 67, 0.8), rgba(29, 68, 67, 0.8))', borderBottom: '1px solid var(--default-border)'}}>
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
                    <tr key={`${item?.nftPurchaseId || index}`} className="transition-colors duration-200 hover:bg-opacity-20" style={{
                      borderBottom: '1px solid var(--default-border)',
                      backgroundColor: 'rgba(29, 68, 67, 0.1)'
                    }}>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{index + 1}</td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.level === 1 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          item.level === 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        }`}>
                          L{item.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{item?.referral?.name || "Unknown"}</td>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{item?.referral?.memberId || "-"}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>{formatCurrency(item?.spotIncome)}</td>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                        <span className="text-xs font-mono">{item?.nftCode || "-"}</span>
                      </td>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{formatDate(item?.purchaseDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center" colSpan={7} style={{color: 'rgba(255, 255, 255, 0.8)'}}>
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


