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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1565c0] mb-2">Level Income Details</h1>
          <p className="text-[#1565c0]/80">
            Level is conditional upon maintaining an active trade
          </p>
        </div>

        {/* Summary Cards */}
        {levelIncomeData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-xl p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {levelIncomeData.summary.totalEntries}
                </div>
                <div className="text-sm text-white/80">Total NFT Purchases</div>
              </div>
            </div>
            <div className="rounded-xl p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(levelIncomeData.summary.totalLevelIncome)}
                </div>
                <div className="text-sm text-white/80">Total Earned</div>
              </div>
            </div>
            <div className="rounded-xl p-6 border" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(levelIncomeData.summary.totalDailyAmount)}
                </div>
                <div className="text-sm text-white/80">Daily Bonus</div>
              </div>
            </div>
          </div>
        )}

        {/* Level Income Table */}
        <div className="rounded-xl border overflow-hidden" style={{background:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
          <div className="px-6 py-4 border-b" style={{borderColor:'#fff'}}>
            <h2 className="text-xl font-semibold text-white">Referral Income Breakdown</h2>
            <p className="text-white/80 text-sm mt-1">
              Detailed breakdown of income from users who used your sponsor ID
            </p>
          </div>

          {/* Responsive Table for all devices */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead style={{background:'#1565c0'}}>
                <tr>
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">Level</th>
                  <th className="px-6 py-4 text-white font-semibold">Referrals</th>
                  <th className="px-6 py-4 text-white font-semibold">Number of NFT Purchased</th>
                  <th className="px-6 py-4 text-white font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }, (_, li) => li + 1).flatMap((lvl) => (
                  groupedLevels[lvl] && groupedLevels[lvl].length > 0
                    ? groupedLevels[lvl].map((entry, idx) => (
                        <tr key={`${lvl}-${entry.referral?.memberId || entry.referral?.email || idx}`} className="hover:bg-white/10 transition-colors">
                          <td className="px-6 py-4 text-white/80">{idx + 1}</td>
                          <td className="px-6 py-4 font-semibold">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1565c0] border border-[#1565c0]">L{lvl}</span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{entry.referral?.name || "Unknown"}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1565c0] border border-[#1565c0]">
                              {entry.nftPurchaseCount || 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white/80">{formatDate(entry.lastPayment)}</td>
                        </tr>
                      ))
                    : [
                        <tr key={`empty-${lvl}`}>
                          <td className="px-6 py-4 text-center text-white/80" colSpan={5}>
                            No referrals at Level {lvl}
                          </td>
                        </tr>
                      ]
                ))}
              </tbody>
            </table>
          </div>

          {(!levelIncomeData?.levelIncomeDetails || levelIncomeData.levelIncomeDetails.length === 0) && (
            <div className="text-center py-12">
              <div className="text-white/80 text-lg">No referral income data available</div>
              <div className="text-white/60 text-sm mt-2">
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
