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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nftPurchases, setNftPurchases] = useState([]); // Add this line

  // Truncate to 5 decimals without rounding
  const formatFixed5Trunc = (value) => {
    const str = String(value ?? 0).trim();
    if (!str) return '0.00000';
    let s = str;
    let sign = '';
    if (s.startsWith('+')) s = s.slice(1);
    if (s.startsWith('-')) { sign = '-'; s = s.slice(1); }
    const [intRaw, fracRaw = ''] = s.split('.');
    const intPart = intRaw && /\d/.test(intRaw) ? intRaw.replace(/[^0-9]/g, '') || '0' : '0';
    const fracPart = fracRaw.replace(/[^0-9]/g, '');
    const truncated = (fracPart + '00000').slice(0, 5);
    return `${sign}${intPart}.${truncated}`;
  };

  // Format currency to show exact value without unnecessary trailing zeros
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    
    // Handle string values that might already be formatted
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      
      // If the string has more precision than parseFloat, use the string directly
      if (value.includes('.') && value.split('.')[1].length > 15) {
        // Remove trailing zeros but keep significant digits
        return value.replace(/\.?0+$/, '');
      }
      
      // For normal string numbers, use parseFloat and format
      return num.toString().replace(/\.?0+$/, '');
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    
    // Convert to string and handle decimal places
    const str = num.toString();
    if (str.includes('.')) {
      // Remove trailing zeros after decimal point
      return str.replace(/\.?0+$/, '');
    }
    return str;
  };

  // Format currency to show 4 decimal places without unnecessary trailing zeros
  const formatCurrency4Digits = (value) => {
    if (value === null || value === undefined || value === '') return '0.0000';
    
    // If it's a string, parse it
    let num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.0000';
    
    // Use toFixed(4) to get exactly 4 decimal places
    let str = num.toFixed(4);
    
    // Remove trailing zeros AFTER the decimal, but keep meaningful digits
    // Match: decimal point followed by any trailing zeros at the end
    // This will keep like 1.2300 as 1.23, but 1.2345 stays 1.2345
    str = str.replace(/(\.\d*?)0+$/, '$1');
    
    // If we end up with just a decimal point, remove it
    str = str.replace(/\.$/, '');
    
    return str;
  };

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

      // Fetch NFT purchases
      const nftResponse = await fetch('/api/nft/purchases', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      let nftData = { purchases: [] };
      if (nftResponse.ok) {
        nftData = await nftResponse.json();
      }
      const currentNftPurchases = Array.isArray(nftData.purchases) ? nftData.purchases : [];
      setNftPurchases(currentNftPurchases);
      
      const isActive = currentNftPurchases.length > 0;
      const statusText = isActive ? "Active" : "Inactive";

      setDashboardData({ 
        ...data, 
        userName: user?.name || data.userName || "John Doe", 
        userEmail: user?.email || data.userEmail || "john.doe@example.com",
        status: statusText, // Set status based on NFT purchases
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token, fetchDashboardData]);

  // Auto-refresh disabled per request


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
    status: nftPurchases.length > 0 ? "Active" : "Inactive", // Dynamically set status in fallback
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
    totalNftPurchaseAmount: "400.00", // 5 NFTs × $80 = $400
    totalSponsorsIncome: "1250.50",
    totalLevelIncome: "0.00", // Added missing totalLevelIncome
    totalWithdrawalAmount: "750.25",
    totalSpotIncome: "850.75",
    directMembersNftVolume: "160.00", // 2 NFTs × $80 = $160 (example)
    totalMembersNftVolume: "400.00", // 5 NFTs × $80 = $400 (example)
    userName: user?.name || "John Doe", // Fallback for user name
    userEmail: user?.email || "john.doe@example.com", // Fallback for user email
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
                   {}
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
            {/* <div className="absolute -top-3 -left-3 z-10">
              <Link href="/swap">
                <div className="btn-enhanced text-white font-bold text-xs px-3 py-1.5 shadow-2xl hover-bounce hover-glow cursor-pointer relative overflow-hidden group">
                  <span className="relative z-10 flex items-center space-x-1">
                    <span className="text-sm animate-rotate">🚀</span>
                    <span>PICZEL TRADE</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            </div> */}
          </div>

          {/* User Name */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-blue-light rounded-2xl border" style={{animationDelay: '0.2s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(74, 222, 255)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>User Name</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(74, 222, 255)'}}>{data.userName}</div>
            </div>
          </div>

          {/* User Email */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-purple-light rounded-2xl border" style={{animationDelay: '0.3s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(192, 132, 252)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Email</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(192, 132, 252)'}}>{data.userEmail}</div>
            </div>
          </div>

          {/* Status */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-green rounded-2xl border" style={{animationDelay: '0.2s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(var(--success-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Status</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(var(--success-rgb))'}}>{data.status}</div>
            </div>
          </div>

          {/* Total Team */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-blue rounded-2xl border" style={{animationDelay: '0.4s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(var(--info-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Members</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(var(--info-rgb))'}}>{data.totalTeam}</div>
            </div>
          </div>

          {/* My Directs */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-purple rounded-2xl border" style={{animationDelay: '0.5s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(143, 0, 255)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Direct Members</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(143, 0, 255)'}}>{data.myDirects}</div>
            </div>
          </div>

          {/* Wallet */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-green rounded-2xl border" style={{animationDelay: '0.6s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(var(--success-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Available Balance</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(var(--success-rgb))'}}>${data.wallet}</div>
            </div>
          </div>

          {/* Total NFT Purchases */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-cyan rounded-2xl border" style={{animationDelay: '0.7s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(6, 182, 212)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total NFT Purchases</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(6, 182, 212)'}}>{data.totalNftPurchases || 0}</div>
            </div>
          </div>

          {/* Total NFT Purchase Amount */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-indigo rounded-2xl border" style={{animationDelay: '0.75s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(99, 102, 241)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total purchased amount</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(99, 102, 241)'}}>${data.totalNftPurchaseAmount || 0}</div>
            </div>
          </div>

          {/* Total Level Income */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-emerald rounded-2xl border" style={{animationDelay: '0.8s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(16, 185, 129)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Level Income</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(16, 185, 129)'}}>${formatCurrency4Digits(data.levelIncome ?? data.totalLevelIncome ?? 0)}</div>
            </div>
          </div>

          {/* Total Withdrawal Amount */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-orange rounded-2xl border" style={{animationDelay: '0.9s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(249, 115, 22)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Withdrawal Amount</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(249, 115, 22)'}}>${data.totalWithdrawalAmount || 0}</div>
            </div>
          </div>

          {/* Total Spot Income */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-violet rounded-2xl border" style={{animationDelay: '1.0s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(139, 69, 19)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Spot Income</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(139, 69, 19)'}}>${data.totalSpotIncome || 0}</div>
            </div>
          </div>

          {/* Direct Members Volume */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-teal rounded-2xl border" style={{animationDelay: '1.1s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(20, 184, 166)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Direct Members NFT Volume</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(20, 184, 166)'}}>${data.directMembersNftVolume || data.memberVolumes?.directMembersVolume || 0}</div>
            </div>
          </div>

          {/* Total Members Volume */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp glow-border-rose rounded-2xl border" style={{animationDelay: '1.2s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(244, 63, 94)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Members NFT Volume</div>
              <div className="font-bold text-lg gradient-text-neon" style={{color: 'rgb(244, 63, 94)'}}>${data.totalMembersNftVolume || data.memberVolumes?.totalMembersVolume || 0}</div>
            </div>
          </div>

          {/* Sponsor Information & Referral Card - Same Row */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 flex flex-col lg:flex-row gap-4">
            {/* Sponsor Card */}
            {data.sponsorInfo && (
              <div className="flex-1">
                <div className="relative p-3 rounded-xl border border-dashed hover-lift-enhanced animate-fadeInUp" 
                     style={{
                       animationDelay: '1.3s', 
                       backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                       backdropFilter: 'blur(10px)', 
                       borderColor: 'var(--primary-color)'
                     }}>
                  {/* Crown Icon */}
                  <div className="absolute -top-2 left-3">
                    <div className="px-2 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1"
                         style={{
                           background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                           color: 'white'
                         }}>
                      <span>👑</span>
                      <span>SPONSOR</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="pt-3 flex items-center space-x-2">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                         style={{background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'}}>
                      {data.sponsorInfo.name ? data.sponsorInfo.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    
                    {/* Sponsor Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs gradient-text-neon truncate" 
                           style={{color: 'var(--primary-color)'}}>
                        Sponsored by: {data.sponsorInfo.name || 'Unknown'}
                      </div>
                      <div className="text-xs truncate" 
                           style={{color: 'rgba(255, 255, 255, 0.5)'}}>
                        ID: {data.sponsorInfo.memberId || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: 'var(--primary-color)'}}></div>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: 'var(--secondary-color)', animationDelay: '0.2s'}}></div>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: 'var(--primary-color)', animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                  
                  {/* Bottom Border Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
                       style={{background: 'linear-gradient(90deg, transparent, var(--primary-color), transparent)'}}></div>
                </div>
              </div>
            )}

            {/* Referral Card - Responsive Size */}
            <div className="w-full lg:w-56">
              <div className="p-4 rounded-xl border hover-lift-enhanced" style={{backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Your Referral Link</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ml-2" style={{backgroundColor: 'rgba(34,197,94,0.15)', color: 'rgb(34,197,94)', border: '1px solid rgba(34,197,94,0.3)'}}>
                    Active
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="text"
                        value={`https://www.piczelnft.com/signup?sponsor=${data.memberId}`}
                        readOnly
                        className="flex-1 w-full px-2 py-1.5 rounded-lg text-xs bg-gray-800 border text-white"
                        style={{borderColor: 'var(--default-border)'}}
                      />
                      <button
                        onClick={() => {
                          const link = `https://www.piczelnft.com/signup?sponsor=${data.memberId}`;
                          navigator.clipboard.writeText(link);
                          alert('Referral link copied to clipboard!');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                        style={{backgroundColor: 'rgba(59,130,246,0.8)', border: '1px solid rgba(59,130,246,0.3)'}}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span style={{color: 'rgba(255,255,255,0.6)'}}>Member ID:</span>
                    <span className="font-semibold text-white truncate ml-2">{data.memberId}</span>
                  </div>
                </div>
              </div>
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