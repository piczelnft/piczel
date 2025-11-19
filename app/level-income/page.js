"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function LevelIncomePage() {
  const [levelIncomeData, setLevelIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchLevelIncomeData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch("/api/level-income", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch level income data");
        }

        const data = await response.json();
        setLevelIncomeData(data);
      } catch (err) {
        console.error("Error fetching level income data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLevelIncomeData();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '$0.00';
    
    // Handle string values that might already be formatted
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isNaN(num)) return '$0.00';
      
      // If the string has more precision than parseFloat, use the string directly
      if (value.includes('.') && value.split('.')[1].length > 15) {
        // Remove trailing zeros but keep significant digits
        return '$' + value.replace(/\.?0+$/, '');
      }
      
      // For normal string numbers, use parseFloat and format
      return '$' + num.toString().replace(/\.?0+$/, '');
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    
    // Convert to string and handle decimal places
    const str = num.toString();
    if (str.includes('.')) {
      // Remove trailing zeros after decimal point
      return '$' + str.replace(/\.?0+$/, '');
    }
    return '$' + str;
  };

  // Group level income details by level (L1..L10), but only show one row per user per level
  const groupedLevels = {};
  for (let i = 1; i <= 10; i++) groupedLevels[i] = [];
  if (levelIncomeData?.levelIncomeDetails && Array.isArray(levelIncomeData.levelIncomeDetails)) {
    // Map to keep only one entry per user per level
    const userMapByLevel = {};
    for (let i = 1; i <= 10; i++) userMapByLevel[i] = {};
    levelIncomeData.levelIncomeDetails.forEach((d) => {
      const lvl = Number(d.level) || 1;
      const useLvl = lvl >= 1 && lvl <= 10 ? lvl : 1;
      const userId = d.referral?.memberId || d.referral?.email || d.referral?.name || Math.random();
      // If not already present, add this entry for the user at this level
      if (!userMapByLevel[useLvl][userId]) {
        userMapByLevel[useLvl][userId] = { ...d, nftPurchaseCount: 1 };
      } else {
        // Aggregate NFT purchases count
        userMapByLevel[useLvl][userId].nftPurchaseCount = (userMapByLevel[useLvl][userId].nftPurchaseCount || 1) + 1;
      }
    });
    for (let i = 1; i <= 10; i++) {
      groupedLevels[i] = Object.values(userMapByLevel[i]);
    }
  }

  const levelSummaries = {};
  for (let i = 1; i <= 10; i++) {
    const list = groupedLevels[i] || [];
    const totals = list.reduce(
      (acc, item) => {
        acc.totalCommission += parseFloat(item.totalCommission || 0);
        acc.totalPaid += parseFloat(item.totalPaid || 0);
        acc.remainingAmount += parseFloat(item.remainingAmount || 0);
        acc.dailyAmount += parseFloat(item.dailyAmount || 0);
        acc.entries += 1; // Count individual entries (each NFT purchase)
        return acc;
      },
      { totalCommission: 0, totalPaid: 0, remainingAmount: 0, dailyAmount: 0, entries: 0 }
    );
    levelSummaries[i] = totals;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#1565c0] text-xl">Loading level income data...</div>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1565c0] mb-2">Level Income Details</h1>
          <p className="text-sm sm:text-base text-[#1565c0]/80 px-2 sm:px-0">
            Level is conditional upon maintaining an active trade
          </p>
        </div>

        {/* Summary Cards */}
        {levelIncomeData?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {levelIncomeData.summary.totalEntries}
                </div>
                <div className="text-xs sm:text-sm text-white/80">Total NFT Purchases</div>
              </div>
            </div>
            <div className="rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {formatCurrency(levelIncomeData.summary.totalLevelIncome)}
                </div>
                <div className="text-xs sm:text-sm text-white/80">Total Earned</div>
              </div>
            </div>
            <div className="rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border sm:col-span-2 lg:col-span-1" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {formatCurrency(levelIncomeData.summary.totalDailyAmount)}
                </div>
                <div className="text-xs sm:text-sm text-white/80">Daily Bonus</div>
              </div>
            </div>
          </div>
        )}

        {/* Level Income Table */}
        <div className="rounded-lg sm:rounded-xl border overflow-hidden" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b" style={{borderColor:'#fff'}}>
            <h2 className="text-lg sm:text-xl font-semibold text-white">Referral Income Breakdown</h2>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              Detailed breakdown of income from users who used your sponsor ID
            </p>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden p-3 space-y-3">
            {Array.from({ length: 10 }, (_, li) => li + 1).flatMap((lvl) => (
              groupedLevels[lvl] && groupedLevels[lvl].length > 0
                ? groupedLevels[lvl].map((entry, idx) => (
                    <div key={`${lvl}-${entry.referral?.memberId || entry.referral?.email || idx}`} className="bg-white/10 rounded-lg p-3 border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-white/60">#{idx + 1}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#1565c0]">
                          L{lvl}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-white/70">Referral:</span>
                          <span className="text-sm font-medium text-white">{entry.referral?.name || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/70">NFT Purchased:</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#1565c0]">
                            {entry.nftPurchaseCount || 1}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-white/70">Date:</span>
                          <span className="text-xs text-white/80">{formatDate(entry.lastPayment)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                : [
                    <div key={`empty-${lvl}`} className="bg-white/5 rounded-lg p-3 text-center">
                      <span className="text-xs text-white/60">No referrals at Level {lvl}</span>
                    </div>
                  ]
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead style={{background:'#1565c0'}}>
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">S.No</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Level</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Referrals</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Number of NFT Purchased</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-xs lg:text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }, (_, li) => li + 1).flatMap((lvl) => (
                  groupedLevels[lvl] && groupedLevels[lvl].length > 0
                    ? groupedLevels[lvl].map((entry, idx) => (
                        <tr key={`${lvl}-${entry.referral?.memberId || entry.referral?.email || idx}`} className="hover:bg-white/10 transition-colors">
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-white/80 text-xs lg:text-sm">{idx + 1}</td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">
                            <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1565c0] border border-[#1565c0]">L{lvl}</span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-xs lg:text-sm">{entry.referral?.name || "Unknown"}</td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                            <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1565c0] border border-[#1565c0]">
                              {entry.nftPurchaseCount || 1}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-white/80 text-xs lg:text-sm">{formatDate(entry.lastPayment)}</td>
                        </tr>
                      ))
                    : [
                        <tr key={`empty-${lvl}`}>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-center text-white/80 text-xs lg:text-sm" colSpan={5}>
                            No referrals at Level {lvl}
                          </td>
                        </tr>
                      ]
                ))}
              </tbody>
            </table>
          </div>

          {(!levelIncomeData?.levelIncomeDetails || levelIncomeData.levelIncomeDetails.length === 0) && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-white/80 text-base sm:text-lg">No referral income data available</div>
              <div className="text-white/60 text-xs sm:text-sm mt-2 px-4">
                Income will appear here when users sign up using your sponsor ID and purchase NFTs
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {/* <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">How Referral Income Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-emerald-400 mb-2">Commission Structure</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Direct Referrals (Level 1): 10% commission</li>
                <li>• When someone uses your sponsor ID</li>
                <li>• You earn 10% of their NFT purchases</li>
                <li>• Commission distributed over 365 days</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium text-green-400 mb-2">Payment Schedule</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Commissions distributed over 365 days</li>
                <li>• Daily payments processed automatically</li>
                <li>• Immediate first-day payout</li>
                <li>• Track remaining amounts and schedules</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
