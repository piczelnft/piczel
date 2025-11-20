"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '../lib/auth-utils';
import DisclaimerPopup from './components/DisclaimerPopup';

export default function Home() {
  const { user, token } = useAuth();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nftPurchases, setNftPurchases] = useState([]); // Add this line
  const [deactivationCountdown, setDeactivationCountdown] = useState(null);
  const [deactivationScheduledAt, setDeactivationScheduledAt] = useState(null);

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

      setDashboardData({ 
        ...data, 
        userName: user?.name || data.userName || "John Doe", 
        userEmail: user?.email || data.userEmail || "john.doe@example.com",
        // Use the status from API (which comes from user.isActivated in database)
      });
      
      // Store deactivation schedule if exists
      if (data.deactivationScheduledAt) {
        setDeactivationScheduledAt(new Date(data.deactivationScheduledAt));
      } else {
        setDeactivationScheduledAt(null);
        setDeactivationCountdown(null);
      }
      
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

  // Countdown timer for deactivation
  useEffect(() => {
    if (!deactivationScheduledAt) {
      setDeactivationCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = deactivationScheduledAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setDeactivationCountdown('00:00:00');
        // Refresh dashboard data to get updated status
        fetchDashboardData();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setDeactivationCountdown(`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`);
      } else {
        setDeactivationCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deactivationScheduledAt, fetchDashboardData]);

  // Auto-refresh disabled per request


  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black text-center">
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black text-center max-w-md">
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
    status: "Inactive", // Default fallback status
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
    <div className="relative overflow-hidden bg-white min-h-screen">
        <DisclaimerPopup />
        {/* Animated Background */}
        {/* Removed animated background for clean white look */}

        {/* Hero Section */}
        <div className="relative z-10 pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex items-center space-x-4">
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
         {/* Sponsor Information & Referral Card - TOP (styled like other dashboard cards) */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sponsor Card */}
            {data.sponsorInfo && (
              <div className="lg:col-span-2">
                <div className="p-6 rounded-2xl border" style={{backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-sm font-semibold mb-1 text-white">
                      Sponsored by: {data.sponsorInfo.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-300">
                      ID: {data.sponsorInfo.memberId || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Card */}
            <div className="lg:col-span-1">
              <div className="p-6 rounded-2xl border" style={{backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-full text-center">
                    <div className="text-sm font-semibold text-white mb-1">Referral Link</div>
                    <div className="text-xs text-gray-300 mb-2">Member ID: <span className="font-semibold text-white">{data.memberId}</span></div>
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <input
                      type="text"
                      value={`https://www.piczelnft.com/signup?sponsor=${data.memberId}`}
                      readOnly
                      className="flex-1 px-3 py-2 rounded-lg text-xs border text-white"
                      style={{backgroundColor: '#1565c0', borderColor: '#1976d2'}}
                    />
                    <button
                      onClick={() => {
                        const link = `https://www.piczelnft.com/signup?sponsor=${data.memberId}`;
                        navigator.clipboard.writeText(link);
                        alert('Referral link copied to clipboard!');
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:scale-105"
                      style={{backgroundColor: 'rgba(59,130,246,0.9)', border: '1px solid rgba(59,130,246,0.3)'}}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
         </div>

         {/* Dashboard Cards Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {/* Member ID */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 "></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Member ID</div>
              <div className="text-white font-bold text-lg">{data.memberId}</div>
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
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(74, 222, 255)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>User Name</div>
              <div className="font-bold text-lg text-white">{data.userName}</div>
            </div>
          </div>

          {/* User Email */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(192, 132, 252)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Email</div>
              <div className="font-bold text-lg text-white">{data.userEmail}</div>
            </div>
          </div>

          {/* Status */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(var(--success-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Status</div>
              <div className="font-bold text-lg text-white">{data.status}</div>
              {deactivationCountdown && data.status === 'Active' && (
                <div className="mt-2">
                  <div className="text-xs font-semibold" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Deactivating in:</div>
                  <div 
                    className="font-bold text-xl mt-1" 
                    style={{
                      color: '#ffd600',
                      animation: 'pulse 1s ease-in-out infinite'
                    }}
                  >
                    {deactivationCountdown}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Team */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '0.4s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(var(--info-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Members</div>
              <div className="font-bold text-lg text-white">{data.totalTeam}</div>
            </div>
          </div>

          {/* My Directs */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '0.5s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(143, 0, 255)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Direct Members</div>
              <div className="font-bold text-lg text-white">{data.myDirects}</div>
            </div>
          </div>

          {/* Wallet */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '0.6s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(var(--success-rgb))'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Available Balance</div>
              <div className="font-bold text-lg text-white">${data.wallet}</div>
            </div>
          </div>

          {/* Total NFT Purchases */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '0.7s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(6, 182, 212)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total NFT Purchases</div>
              <div className="font-bold text-lg text-white">{data.totalNftPurchases || 0}</div>
            </div>
          </div>

          {/* Total NFT Purchase Amount */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp relative rounded-2xl border" style={{animationDelay: '0.1s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(99, 102, 241)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total purchased amount</div>
              <div className="font-bold text-lg text-white">${data.totalNftPurchaseAmount || 0}</div>
            </div>
          </div>

          {/* Total Level Income */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '0.8s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(16, 185, 129)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Level Income</div>
              <div className="font-bold text-lg text-white">${formatCurrency4Digits(data.levelIncome ?? data.totalLevelIncome ?? 0)}</div>
            </div>
          </div>

          {/* Total Withdrawal Amount */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '0.9s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(249, 115, 22)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Withdrawal Amount</div>
              <div className="font-bold text-lg text-white">${data.totalWithdrawalAmount || 0}</div>
            </div>
          </div>

          {/* Total Spot Income */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.0s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(139, 69, 19)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Spot Income</div>
              <div className="font-bold text-lg text-white">${data.totalSpotIncome || 0}</div>
            </div>
          </div>

          {/* Direct Members Volume */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.1s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(20, 184, 166)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Direct Members NFT Volume</div>
              <div className="font-bold text-lg text-white">${data.directMembersNftVolume || data.memberVolumes?.directMembersVolume || 0}</div>
            </div>
          </div>

          {/* Total Members Volume */}
          <div className="p-6 hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.2s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <div className="text-center relative">
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full gradient-text-neon" style={{backgroundColor: 'rgb(244, 63, 94)'}}></div>
              <div className="text-sm mb-2 font-medium" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Total Members NFT Volume</div>
              <div className="font-bold text-lg text-white">${data.totalMembersNftVolume || data.memberVolumes?.totalMembersVolume || 0}</div>
            </div>
          </div>

          {/* NFT Buy Button as a Card */}
          <div className="p-6 flex flex-col justify-center items-center hover-lift-enhanced animate-fadeInUp rounded-2xl border" style={{animationDelay: '1.3s', backgroundColor: '#1565c0', color: '#fff', border: 'none'}}>
            <Link href="/nft-buy">
              <button
                  className="px-6 py-3 rounded-xl font-bold text-base text-white transition-all duration-300 hover:scale-105 hover-bounce-enhanced"
                  style={{
                    backgroundColor: '#0d47a1', // darker blue
                    border: '2px solid #0d47a1',
                    boxShadow: '0 6px 20px rgba(13,71,161,0.2), 0 0 0 1px rgba(13,71,161,0.08)',
                  }}
                >
                  Buy NFTs
                </button>
            </Link>
          </div>
        </div>

        {/* NFT Buy Button Section removed, now in grid */}
      </div>
    </div>
  );
}