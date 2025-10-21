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

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

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
                  {levelIncomeData.summary.totalLevels}
                </div>
                <div className="text-sm text-gray-300">Active Referrals</div>
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
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(levelIncomeData.summary.totalRemaining)}
                </div>
                <div className="text-sm text-gray-300">Remaining</div>
              </div>
            </div>
            
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Referral Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Commission Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Commission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Daily Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    NFT Purchases
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {levelIncomeData?.levelIncomeDetails?.map((referral, index) => (
                  <tr key={referral.referral.memberId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {referral.referral.avatar ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={referral.referral.avatar}
                              alt={referral.referral.name}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {referral.referral.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {referral.referral.name}
                          </div>
                          <div className="text-sm text-gray-300">
                            {referral.referral.memberId}
                          </div>
                          <div className="text-xs text-gray-400">
                            {referral.referral.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        {referral.commissionRate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(referral.totalCommission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                      {formatCurrency(referral.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-300">
                      {formatCurrency(referral.remainingAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                      {formatCurrency(referral.dailyAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(referral.lastPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="max-w-xs">
                        {referral.sourceInfo && referral.sourceInfo.length > 0 ? (
                          <div className="space-y-1">
                            {referral.sourceInfo.slice(0, 2).map((source, idx) => (
                              <div key={idx} className="text-xs">
                                <div className="text-green-400">
                                  NFT #{source.nftPurchaseId?.toString().slice(-6) || 'N/A'}
                                </div>
                                <div className="text-green-300">
                                  ${source.commissionAmount.toFixed(2)} commission
                                </div>
                                <div className="text-gray-400">
                                  {formatDate(source.purchaseDate)}
                                </div>
                              </div>
                            ))}
                            {referral.sourceInfo.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{referral.sourceInfo.length - 2} more...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            <div className="text-gray-500">No NFT purchases yet</div>
                            <div className="text-gray-600">Commission will appear when they buy NFTs</div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
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
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
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
        </div>
      </div>
    </div>
  );
}
