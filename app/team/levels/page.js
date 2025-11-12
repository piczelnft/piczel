'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TeamLevelsPage = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelIncomeData, setLevelIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || Number.isNaN(amount)) return '-';
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (!Number.isFinite(num)) return '-';
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

  // Fetch level income data (shows each NFT purchase commission)
  const fetchLevelIncomeData = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/level-income', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch level income data');
      }

      const data = await response.json();
      setLevelIncomeData(data);
    } catch (err) {
      console.error('Error fetching level income data:', err);
      setError(err.message);
      setLevelIncomeData(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchLevelIncomeData();
  }, [fetchLevelIncomeData]);

  const handleLevelAction = (level) => {
    setSelectedLevel(level);
  };

  // Loading state
  if (loading && !levelIncomeData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading level income...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !levelIncomeData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={fetchLevelIncomeData}
            className="btn-enhanced px-4 py-2 text-white hover-bounce"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group level income details by level (L1..L10)
  // Each entry represents a single NFT purchase commission
  const groupedLevels = {};
  for (let i = 1; i <= 10; i++) groupedLevels[i] = [];
  if (levelIncomeData?.levelIncomeDetails && Array.isArray(levelIncomeData.levelIncomeDetails)) {
    levelIncomeData.levelIncomeDetails.forEach((d) => {
      const lvl = Number(d.level) || 1;
      const useLvl = lvl >= 1 && lvl <= 10 ? lvl : 1;
      groupedLevels[useLvl].push(d);
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Level Member Table</h1>
          <p className="text-gray-300">
            Track your income from users at each level
          </p>
          <div className="mt-4">
            <button 
              onClick={fetchLevelIncomeData}
              className="btn-enhanced px-4 py-2 text-white hover-bounce text-sm flex items-center space-x-2"
              disabled={loading}
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>
                {loading ? '⟳' : '↻'}
              </span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {levelIncomeData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {levelIncomeData.summary.totalEntries}
                </div>
                <div className="text-sm text-gray-300">Total NFT Purchases</div>
              </div>
            </div> */}
            
            {/* <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(levelIncomeData.summary.totalLevelIncome)}
                </div>
                <div className="text-sm text-gray-300">Total Earned</div>
              </div>
            </div> */}
            
            {/* <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(levelIncomeData.summary.totalRemaining)}
                </div>
                <div className="text-sm text-gray-300">Remaining</div>
              </div>
            </div> */}
            
            {/* <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(levelIncomeData.summary.totalDailyAmount)}
                </div>
                <div className="text-sm text-gray-300">Daily Amount</div>
              </div>
            </div> */}
          </div>
        )}

        {/* Level Income Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Level Income Breakdown</h2>
            <p className="text-gray-300 text-sm mt-1">
              Individual NFT purchase commissions from each level
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Referral Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Purchase Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              {Array.from({ length: 10 }, (_, li) => li + 1).map((lvl) => (
                <tbody key={`level-${lvl}`} className="divide-y divide-white/10">
                  <tr className="bg-white/6">
                    <td colSpan={6} className="px-6 py-3 text-sm font-semibold text-white">
                      Level {lvl} — {groupedLevels[lvl]?.length || 0} NFT purchase(s)
                      {groupedLevels[lvl] && groupedLevels[lvl].length > 0 && (
                        <span className="ml-4 text-sm text-green-300">
                          Paid: {formatCurrency(levelSummaries[lvl].totalPaid)}
                        </span>
                      )}
                    </td>
                  </tr>

                  {groupedLevels[lvl] && groupedLevels[lvl].length > 0 ? (
                    groupedLevels[lvl].map((entry, idx) => (
                      <tr key={`${lvl}-${entry.nftPurchaseId}-${idx}`} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            L{entry.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{entry.referral.name}</div>
                          <div className="text-sm text-gray-300">{entry.referral.memberId}</div>
                          <div className="text-xs text-gray-400">{entry.referral.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{formatCurrency(entry.totalPaid)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(entry.purchaseDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            entry.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-xs text-gray-400">No NFT purchases at Level {lvl}</td>
                    </tr>
                  )}
                </tbody>
              ))}
            </table>
          </div>

          {(!levelIncomeData?.levelIncomeDetails || levelIncomeData.levelIncomeDetails.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No level income history available</div>
              <div className="text-gray-500 text-sm mt-2">
                Income will appear here when users sign up using your sponsor ID and purchase NFTs
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamLevelsPage;
