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
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1565c0] mb-2">Spot Income History</h1>
          <p className="text-sm sm:text-base text-[#1565c0]/80 px-2">See spot income from L1, L2, and L3 referrals and when they purchased NFTs</p>
          {/* <div className="mt-3 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Spot income is only received when your account is active (isActivated: true). 
              Inactive users do not receive spot income from referral purchases.
            </p>
          </div> */}
          <div className="mt-3 sm:mt-4">
            <button
              onClick={fetchSpotIncome}
              className="px-3 sm:px-4 py-2 rounded bg-[#1565c0] text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 mx-auto"
            >
              <span className={`text-xs sm:text-sm ${loading ? 'animate-spin' : ''}`}>{loading ? '⟳' : '↻'}</span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {spotIncomeData?.summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {spotIncomeData.summary.totalEntries}
                </div>
                <div className="text-xs sm:text-sm text-white/80">Total Entries</div>
              </div>
            </div>
            <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {formatCurrency(spotIncomeData.summary.totalSpotIncome)}
                </div>
                <div className="text-xs sm:text-sm text-white/80">Total Spot Income</div>
              </div>
            </div>
            <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-xs sm:text-sm font-semibold text-white/80 mb-1">Level 1</div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">
                  {spotIncomeData.summary.levelSummaries?.L1?.count || 0}
                </div>
                <div className="text-[10px] sm:text-xs text-white/80">{formatCurrency(spotIncomeData.summary.levelSummaries?.L1?.total || 0)}</div>
              </div>
            </div>
            <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-xs sm:text-sm font-semibold text-white/80 mb-1">L2 + L3</div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">
                  {(spotIncomeData.summary.levelSummaries?.L2?.count || 0) + (spotIncomeData.summary.levelSummaries?.L3?.count || 0)}
                </div>
                <div className="text-[10px] sm:text-xs text-white/80">
                  {formatCurrency((spotIncomeData.summary.levelSummaries?.L2?.total || 0) + (spotIncomeData.summary.levelSummaries?.L3?.total || 0))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spot Income Entries by Level */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg" style={{background:'#1565c0', color:'#fff'}}>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {spotIncomeData?.spotIncomeHistory && spotIncomeData.spotIncomeHistory.length > 0 ? (
              spotIncomeData.spotIncomeHistory.map((item, index) => (
                <div key={`${item?.nftPurchaseId || index}`} className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-white/60">#{index + 1}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#1565c0]">
                      L{item.level}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-white/70">Referral:</span>
                      <span className="text-sm font-medium text-white">{item?.referral?.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/70">Spot Income:</span>
                      <span className="text-sm font-bold text-white">{formatCurrency(item?.spotIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/70">NFT Code:</span>
                      <span className="text-xs font-mono text-white/80">{item?.nftCode || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/70">Date:</span>
                      <span className="text-xs text-white/80">{formatDate(item?.purchaseDate)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/80 py-8 text-sm">
                No spot income history available
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead style={{background:'#1565c0'}}>
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">S.No</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Level</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Referral Name</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Spot Income</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">NFT Code</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {spotIncomeData?.spotIncomeHistory && spotIncomeData.spotIncomeHistory.length > 0 ? (
                  spotIncomeData.spotIncomeHistory.map((item, index) => (
                    <tr key={`${item?.nftPurchaseId || index}`} className="transition-colors duration-200 hover:bg-white/10" style={{
                      borderBottom: '1px solid #fff',
                      backgroundColor: '#1565c0'
                    }}>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-white/80 text-xs lg:text-sm">{index + 1}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">
                        <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1565c0] border border-[#1565c0]">
                          L{item.level}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-xs lg:text-sm">{item?.referral?.name || "Unknown"}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-white text-xs lg:text-sm">{formatCurrency(item?.spotIncome)}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-white/80">
                        <span className="text-xs font-mono">{item?.nftCode || "-"}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-white/80 text-xs lg:text-sm">{formatDate(item?.purchaseDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 lg:px-6 py-6 lg:py-8 text-center text-white/80 text-xs lg:text-sm" colSpan={6}>
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


