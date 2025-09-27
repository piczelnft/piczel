'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const { user, token, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
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
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Team</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(var(--info-rgb))'}}>{data.totalTeam}</div>
            </div>
          </div>

          {/* My Directs */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-purple rounded-2xl border" style={{animationDelay: '0.5s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(143, 0, 255)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>My Directs</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(143, 0, 255)'}}>{data.myDirects}</div>
            </div>
          </div>

          {/* Wallet */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-green rounded-2xl border" style={{animationDelay: '0.6s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(var(--success-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Wallet</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(var(--success-rgb))'}}>${data.wallet}</div>
            </div>
          </div>

          {/* Deposit Wallet */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-purple rounded-2xl border" style={{animationDelay: '0.7s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'rgb(var(--secondary-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Deposit Wallet</div>
              <div className="font-bold text-lg animate-neonGlow" style={{color: 'rgb(var(--secondary-rgb))'}}>${data.depositWallet}</div>
            </div>
          </div>
        </div>

        {/* CAPPING 4X Section */}
        {/* <div className="p-8 mb-8 shadow-2xl hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '0.8s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
          <h2 className="text-4xl font-bold text-white mb-8 text-center gradient-text-enhanced animate-neonGlow">CAPPING 4X</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">$ {data.capping.total.toLocaleString()}</div>
              <div className="text-lg" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">$ {typeof data.capping.used === 'number' ? data.capping.used.toLocaleString() : data.capping.used}</div>
              <div className="text-lg" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Used</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">$ {data.capping.balance.toLocaleString()}</div>
              <div className="text-lg" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Balance</div>
            </div>
          </div>
        </div> */}

        

        {/* Income Graphs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income Graph */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border glow-border-blue" style={{animationDelay: '0.9s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Total Income</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,50 L20,30 L40,70 L60,20 L80,80 L100,40 L120,90 L140,10 L160,60 L180,35 L200,55"
                  stroke="url(#primaryGradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary-color)" />
                    <stop offset="50%" stopColor="var(--secondary-color)" />
                    <stop offset="100%" stopColor="var(--primary-color)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1 animate-neonGlow" style={{color: 'rgb(var(--default-text-color-rgb))'}}>${data.incomeStats.totalIncome}</div>
              <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.6)'}}>Total Earnings</div>
            </div>
          </div>

          {/* Affiliate Reward Graph */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border glow-border-green" style={{animationDelay: '1.0s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Affiliate Reward</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,60 L25,25 L50,75 L75,15 L100,85 L125,35 L150,65 L175,20 L200,70"
                  stroke="url(#successGradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(var(--success-rgb))" />
                    <stop offset="50%" stopColor="rgb(var(--primary-rgb))" />
                    <stop offset="100%" stopColor="rgb(var(--success-rgb))" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1 animate-neonGlow" style={{color: 'rgb(var(--success-rgb))'}}>${data.incomeStats.affiliateReward}</div>
              <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.6)'}}>Referral Earnings</div>
            </div>
          </div>

          {/* Monthly Staking Reward Graph */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border glow-border-purple" style={{animationDelay: '1.1s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Monthly Staking Reward</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,80 L30,20 L60,90 L90,10 L120,70 L150,30 L180,85 L200,40"
                  stroke="url(#purpleGradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(143, 0, 255)" />
                    <stop offset="50%" stopColor="rgb(var(--secondary-rgb))" />
                    <stop offset="100%" stopColor="rgb(143, 0, 255)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1 animate-neonGlow" style={{color: 'rgb(143, 0, 255)'}}>${data.incomeStats.stakingReward}</div>
              <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.6)'}}>Staking Returns</div>
            </div>
          </div>

          {/* Community Reward Graph */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border glow-border" style={{animationDelay: '1.2s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Community Reward</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,50 L50,50 L100,50 L150,50 L200,50"
                  stroke="url(#infoGradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="infoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(var(--info-rgb))" />
                    <stop offset="50%" stopColor="rgb(var(--secondary-rgb))" />
                    <stop offset="100%" stopColor="rgb(var(--info-rgb))" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1 animate-neonGlow" style={{color: 'rgb(var(--info-rgb))'}}>${data.incomeStats.communityReward}</div>
              <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.6)'}}>Community Earnings</div>
            </div>
          </div>
        </div>

        {/* Club Statistics Section */}
        {/* <div className="p-6 mb-8 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.3s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
          <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Club Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Club A Team:</span>
                <span className="font-medium group-hover:scale-110 transition-transform duration-300" style={{color: 'rgb(var(--info-rgb))'}}>{data.clubStats.clubATeam}</span>
              </div>
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Club B Team:</span>
                <span className="font-medium group-hover:scale-110 transition-transform duration-300" style={{color: 'rgb(143, 0, 255)'}}>{data.clubStats.clubBTeam}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Club A Business:</span>
                <span className="font-medium group-hover:scale-110 transition-transform duration-300" style={{color: 'rgb(var(--success-rgb))'}}>${data.clubStats.clubABusiness.toLocaleString()}</span>
              </div>
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Club B Business:</span>
                <span className="font-medium" style={{color: 'rgb(var(--default-text-color-rgb))'}}>${data.clubStats.clubBBusiness.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Transaction History */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.4s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Withdrawals</h3>
            <div className="space-y-3">
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Withdrawal:</span>
                <span className="font-medium group-hover:scale-110 transition-transform duration-300" style={{color: 'rgb(var(--danger-rgb))'}}>{data.withdrawals.total}</span>
              </div>
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Today&apos;s Withdrawal:</span>
                <span className="font-medium" style={{color: 'rgb(var(--default-text-color-rgb))'}}>{data.withdrawals.today}</span>
              </div>
            </div>
          </div>

          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.5s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Deposits & Investment</h3>
            <div className="space-y-3">
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Deposit:</span>
                <span className="font-medium group-hover:scale-110 transition-transform duration-300" style={{color: 'rgb(var(--success-rgb))'}}>${data.deposits.total}</span>
              </div>
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Investment:</span>
                <span className="font-medium group-hover:scale-110 transition-transform duration-300" style={{color: 'rgb(var(--info-rgb))'}}>{data.deposits.investment}</span>
              </div>
              <div className="flex justify-between group">
                <span style={{color: 'rgba(255, 255, 255, 0.8)'}}>Current Matching:</span>
                <span className="font-medium" style={{color: 'rgb(var(--default-text-color-rgb))'}}>${data.deposits.matching}</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Referral Links */}
        <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.6s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
          <h3 className="text-lg font-semibold text-white mb-4 gradient-text-neon">Referral Links</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Club A Referral Code:</div>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={data.referralLinks.clubA} 
                  readOnly 
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:border-opacity-50 transition-colors duration-300"
                  style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgb(var(--default-text-color-rgb))', border: '1px solid var(--default-border)'}}
                />
                <button className="btn-enhanced px-4 py-2 text-white hover-bounce text-sm">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
