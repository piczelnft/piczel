"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '../lib/auth-utils';

export default function Home() {
  const { user, token } = useAuth();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch dashboard data`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token, fetchDashboardData]);


  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <div className="space-y-2 mb-4">
            <button 
              onClick={fetchDashboardData}
              className="btn-enhanced px-4 py-2 text-white hover-bounce mr-2"
            >
              Retry Dashboard
            </button>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const data = await response.json();
                  console.log('Test User Response:', data);
                  alert(JSON.stringify(data, null, 2));
                } catch (err) {
                  console.error('Test User Error:', err);
                  alert('Test User Error: ' + err.message);
                }
              }}
              className="btn-enhanced px-4 py-2 text-white hover-bounce"
            >
              Test User API
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Check console for detailed error information
          </p>
        </div>
      </div>
    );
  }

  // Fallback to default data if API fails
  const data = dashboardData || {
    memberId: "DGT123456",
    status: "Active",
    rank: "Basic",
    totalTeam: 863,
    myDirects: 65,
    wallet: "4926.13",
    depositWallet: "0.00",
    capping: {
      total: 40800,
      used: 5528.13,
      balance: 35271.87
    },
    clubStats: {
      clubATeam: 839,
      clubBTeam: 24,
      clubABusiness: 1135733.00,
      clubBBusiness: 0.00
    },
    deposits: {
      total: 100.00,
      investment: "10200 / 1,478.26 USDG",
      matching: 0
    },
    withdrawals: {
      total: "USDG 82.19",
      today: "USDG 0"
    },
    referralLinks: {
      clubA: `http://piczelite.com/member/register/${user?.memberId || 'PIC123456'}/ClubA`,
    },
    incomeStats: {
      totalIncome: "5528.13",
      affiliateReward: "4925.13",
      stakingReward: "603.00",
      communityReward: "0.00"
    },
    totalNftPurchases: 5,
    totalSponsorsIncome: "1250.50",
    totalWithdrawalAmount: "750.25"
  };
  return (
    <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating particles */}
          <div className="particle" style={{top: '10%', left: '10%'}}></div>
          <div className="particle" style={{top: '20%', left: '80%'}}></div>
          <div className="particle" style={{top: '60%', left: '20%'}}></div>
          <div className="particle" style={{top: '80%', left: '70%'}}></div>
          <div className="particle" style={{top: '40%', left: '90%'}}></div>
          
          {/* Gradient orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-700/5 to-teal-600/5 rounded-full blur-3xl animate-float"></div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex items-center space-x-4">
            <button 
              onClick={fetchDashboardData}
              className="btn-enhanced px-4 py-2 text-white hover-bounce text-sm flex items-center space-x-2"
              disabled={loading}
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>
                {loading ? '⟳' : '↻'}
              </span>
              <span>Refresh Data</span>
            </button>
            
              {dashboardData && (
                <div className="text-xs text-green-400">
                  ✅ Live Data
                </div>
              )}
              {!dashboardData && (
                <div className="text-xs text-yellow-400">
                  ⚠️ Using Fallback Data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 relative z-10">
         {/* Dashboard Cards Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {/* Member ID */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp relative rounded-2xl border" style={{animationDelay: '0.1s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'var(--primary-color)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Member ID</div>
              <div className="text-white font-bold text-lg gradient-text-neon">{data.memberId}</div>
            </div>
            {/* Floating PICZEL SWAP Button */}
            <div className="absolute -top-3 -left-3 z-10">
              <Link href="/swap">
                <div className="btn-enhanced text-white font-bold text-xs px-3 py-1.5 shadow-2xl hover-bounce hover-glow cursor-pointer relative overflow-hidden group">
                  <span className="relative z-10 flex items-center space-x-1">
                    <span className="text-sm animate-rotate">🚀</span>
                    <span>PICZEL TRADE</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            </div>
          </div>

          {/* Status */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-green rounded-2xl border" style={{animationDelay: '0.2s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(var(--success-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Status</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(var(--success-rgb))'}}>{data.status}</div>
            </div>
          </div>

          {/* Rank */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-yellow rounded-2xl border" style={{animationDelay: '0.3s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(var(--warning-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Rank</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(var(--warning-rgb))'}}>{data.rank}</div>
            </div>
          </div>

          {/* Total Team */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-blue rounded-2xl border" style={{animationDelay: '0.4s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(var(--info-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Members</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(var(--info-rgb))'}}>{data.totalTeam}</div>
            </div>
          </div>

          {/* My Directs */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-purple rounded-2xl border" style={{animationDelay: '0.5s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(143, 0, 255)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Direct Members</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(143, 0, 255)'}}>{data.myDirects}</div>
            </div>
          </div>

          {/* Wallet */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-green rounded-2xl border" style={{animationDelay: '0.6s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(var(--success-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Available Balance</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(var(--success-rgb))'}}>${data.wallet}</div>
            </div>
          </div>

          {/* Total NFT Purchases */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-cyan rounded-2xl border" style={{animationDelay: '0.7s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(6, 182, 212)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total NFT Purchases</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(6, 182, 212)'}}>{data.totalNftPurchases || 0}</div>
            </div>
          </div>

          {/* Total Sponsors Income */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-emerald rounded-2xl border" style={{animationDelay: '0.8s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(16, 185, 129)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Sponsors Income</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(16, 185, 129)'}}>${data.totalSponsorsIncome || 0}</div>
            </div>
          </div>

          {/* Total Withdrawal Amount */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-orange rounded-2xl border" style={{animationDelay: '0.9s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(249, 115, 22)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Withdrawal Amount</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(249, 115, 22)'}}>${data.totalWithdrawalAmount || 0}</div>
            </div>
          </div>

          {/* Direct Members Volume */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-teal rounded-2xl border" style={{animationDelay: '1.1s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(20, 184, 166)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Direct Members Volume</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(20, 184, 166)'}}>${data.memberVolumes?.directMembersVolume || 0}</div>
            </div>
          </div>

          {/* Total Members Volume */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-rose rounded-2xl border" style={{animationDelay: '1.2s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(244, 63, 94)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Members Volume</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(244, 63, 94)'}}>${data.memberVolumes?.totalMembersVolume || 0}</div>
            </div>
          </div>

          
        </div>

        {/* NFT Buy Button Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-white">Daily NFT Series</h2>
          <p className="text-sm mb-6" style={{color:'rgba(255,255,255,0.7)'}}>
            Buy NFTs, click the button below.
          </p>
          
          {/* NFT Buy Button */}
          <div className="flex justify-center mb-8">
            <Link href="/nft-buy">
            <button
  className="px-12 py-6 rounded-3xl font-extrabold text-2xl text-white transition-all duration-300 hover:scale-110 hover-bounce-enhanced"
  style={{
    background:
      'linear-gradient(135deg, rgba(34,197,94,0.9) 0%, rgba(16,185,129,0.9) 100%)',
    border: '3px solid rgba(34,197,94,0.6)',
    boxShadow:
      '0 12px 40px rgba(34,197,94,0.4), 0 0 0 2px rgba(34,197,94,0.1)',
  }}
>
   Buy NFTs 
</button>

            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}