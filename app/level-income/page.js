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
        userMapByLevel[useLvl][userId] = { ...d };
      } else {
        // Optionally, aggregate spot income or NFT purchases if needed
        // For now, just keep the first occurrence
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading level income data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Level Income Details</h1>
          <p className="text-gray-300">
            Track your income from users who used your sponsor ID and their NFT purchases
          </p>
        </div>

        {/* Summary Cards */}
        {levelIncomeData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {levelIncomeData.summary.totalEntries}
                </div>
                <div className="text-sm text-gray-300">Total NFT Purchases</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(levelIncomeData.summary.totalLevelIncome)}
                </div>
                <div className="text-sm text-gray-300">Total Earned</div>
              </div>
            </div>
            
            {/* <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(levelIncomeData.summary.totalRemaining)}
                </div>
                <div className="text-sm text-gray-300">Remaining</div>
              </div>
            </div> */}
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(levelIncomeData.summary.totalDailyAmount)}
                </div>
                <div className="text-sm text-gray-300">Daily Amount</div>
              </div>
            </div>
          </div>
        )}

        {/* Level Income Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Referral Income Breakdown</h2>
            <p className="text-gray-300 text-sm mt-1">
              Detailed breakdown of income from users who used your sponsor ID
            </p>
          </div>


          {/* Responsive Table for all devices */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">Level</th>
                  <th className="px-6 py-4 text-white font-semibold">Referral Name</th>
                  <th className="px-6 py-4 text-white font-semibold">Member ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Email</th>
                  <th className="px-6 py-4 text-white font-semibold">Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }, (_, li) => li + 1).flatMap((lvl) => (
                  groupedLevels[lvl] && groupedLevels[lvl].length > 0
                    ? groupedLevels[lvl].map((entry, idx) => (
                        <tr key={`${lvl}-${entry.referral?.memberId || entry.referral?.email || idx}`} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4" style={{color: 'rgba(255,255,255,0.8)'}}>{idx + 1}</td>
                          <td className="px-6 py-4 font-semibold">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30`}>L{lvl}</span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{entry.referral?.name || "Unknown"}</td>
                          <td className="px-6 py-4" style={{color: 'rgba(255,255,255,0.8)'}}>{entry.referral?.memberId || "-"}</td>
                          <td className="px-6 py-4" style={{color: 'rgba(255,255,255,0.8)'}}>{entry.referral?.email || "-"}</td>
                          <td className="px-6 py-4" style={{color: 'rgba(255,255,255,0.8)'}}>{formatDate(entry.lastPayment)}</td>
                        </tr>
                      ))
                    : [
                        <tr key={`empty-${lvl}`}>
                          <td className="px-6 py-4 text-center" colSpan={6} style={{color: 'rgba(255,255,255,0.8)'}}>
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
              <div className="text-gray-400 text-lg">No referral income data available</div>
              <div className="text-gray-500 text-sm mt-2">
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
