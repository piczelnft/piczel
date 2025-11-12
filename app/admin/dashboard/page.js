'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setError('No admin token found');
        return;
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading data: {error}</p>
            <button 
              onClick={fetchStats}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome to the PICZEL Admin Panel</p>
      </div>

      {/* Member Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Member Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Members</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatNumber(stats?.members?.total || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Active</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatNumber((stats?.members?.total || 0) - (stats?.members?.inactive || 0))}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Inactive</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {formatNumber(stats?.members?.inactive || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏸️</span>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Blocked</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{formatNumber(stats?.members?.blocked || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Today&apos;s Activation</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">{formatNumber(stats?.members?.todayActivation || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Today&apos;s Upgrade</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats?.financial?.todayUpgrade || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⬆️</span>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Today&apos;s Withdrawal</h3>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats?.financial?.todayWithdrawal || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⬇️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Withdrawal Amount</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(stats?.financial?.totalWithdrawal || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Wallet Balance</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(
                    (stats?.financial?.totalNftPurchaseAmount || 0) - 
                    ((stats?.financial?.totalWithdrawal || 0) - ((stats?.financial?.totalWithdrawal || 0) * 0.10))
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Payout</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(stats?.financial?.totalPayout || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Fund Balance</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(stats?.financial?.totalFundBalance || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏦</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Account Activation & Upgrade */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account & Purchase Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Amount By Purchase</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats?.financial?.totalNftPurchaseAmount || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Today&apos;s Purchase</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats?.financial?.todayNftPurchaseAmount || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⬆️</span>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Withdrawal</h3>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats?.financial?.totalWithdrawal || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⬇️</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Coin Statistics */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Coin Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Buy Coin</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatNumber(stats?.coins?.buyCoin || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Balance of Buy Coin</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🪙</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Freeze Coin</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatNumber(stats?.coins?.freezeCoin || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Balance of Freeze Coin</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Coin Wallet</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatNumber(stats?.coins?.coinWallet || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Balance of Coin Wallet</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Staking Coin</h3>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{formatNumber(stats?.coins?.stakingCoin || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Balance of Staking Coins</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏗️</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Income Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Income Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Spot Income</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats?.income?.spotIncome || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Level Income</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats?.income?.levelIncome || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total ROI Income</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(stats?.income?.roiIncome || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💹</span>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Committee Income</h3>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{formatCurrency(stats?.income?.committeeIncome || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Additional Income & Withdrawal Details */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Reward Income</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats?.income?.rewardIncome || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Withdrawal Gross Amount</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats?.income?.withdrawalGross || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Withdrawal Net Amount</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats?.income?.withdrawalNet || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Deduction on Withdrawal</h3>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats?.income?.withdrawalDeduction || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📉</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      
      
    </AdminLayout>
  );
}
