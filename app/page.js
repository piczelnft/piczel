"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '../lib/auth-utils';

export default function Home() {
  const { user, token } = useAuth();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nftPurchases, setNftPurchases] = useState([]);

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

  // ===== NFT Series (A1..J1) sequential daily gating =====
  const NFT_SERIES = [
    'A1','B1','C1','D1','E1','F1','G1','H1','I1','J1'
  ];

  // Map each NFT code to its image path under public/nfts
  const NFT_IMAGES = {
    A1: '/nft/1.jpg',
    B1: '/nft/2.jpg',
    C1: '/nft/3.jpg',
    D1: '/nft/4.jpg',
    E1: '/nft/5.jpg',
    F1: '/nft/6.jpg',
    G1: '/nft/7.jpg',
    H1: '/nft/8.jpg',
    I1: '/nft/9.jpg',
    J1: '/nft/10.jpg',
  };

  const fetchNftPurchases = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/nft/purchases', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.purchases) ? data.purchases : [];
      setNftPurchases(list.map(p => ({ code: p.code, purchasedAt: p.purchasedAt })));
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    fetchNftPurchases();
  }, [isAuthenticated, token, fetchNftPurchases]);

  const getLastPurchasedIndex = () => {
    if (!nftPurchases.length) return -1;
    const last = nftPurchases[nftPurchases.length - 1];
    return NFT_SERIES.findIndex(c => c === last.code);
  };

  const isOneDayPassedSinceLast = () => {
    if (!nftPurchases.length) return true;
    const last = nftPurchases[nftPurchases.length - 1];
    const lastTime = new Date(last.purchasedAt).getTime();
    const now = Date.now();
    const diffMs = now - lastTime;
    return diffMs >= 24 * 60 * 60 * 1000; // 24 hours
  };

  const getNftStatus = (code) => {
    // owned
    if (nftPurchases.some(p => p.code === code)) {
      return { owned: true, available: false, locked: false };
    }
    const lastIdx = getLastPurchasedIndex();
    const targetIdx = NFT_SERIES.findIndex(c => c === code);
    // next in sequence?
    if (targetIdx === lastIdx + 1) {
      // A1 case when lastIdx==-1 also handled here
      return {
        owned: false,
        available: isOneDayPassedSinceLast() || lastIdx === -1,
        locked: !(isOneDayPassedSinceLast() || lastIdx === -1)
      };
    }
    // future ones locked
    if (targetIdx > lastIdx + 1) {
      return { owned: false, available: false, locked: true };
    }
    // default locked
    return { owned: false, available: false, locked: true };
  };

  const handleBuyNft = async (code) => {
    const status = getNftStatus(code);
    if (!status.available) return;
    try {
      const message = `Buy ${code}? Next NFT unlocks tomorrow.`;
      if (!confirm(message)) return;

      if (!token) {
        alert('Please log in to make a purchase.');
        return;
      }
      const res = await fetch('/api/nft/purchases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, series: code.charAt(0), purchasedAt: new Date().toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Purchase failed' }));
        throw new Error(data.error || 'Purchase failed');
      }
      const data = await res.json();
      const next = [...nftPurchases, { code, purchasedAt: new Date().toISOString() }];
      setNftPurchases(next);
      
      // Display success message with commission details (use server-calculated reward)
      const received = (data.userReward ?? 0).toFixed(2);
      const displayBalance = data.user?.wallet?.balance || data.user?.walletBalance || 0;
      let successMessage = `🎉 Purchase Successful!\n\nNFT: ${code}\nYou received: $${received}\nYour Balance: $${Number(displayBalance).toFixed(2)}`;
      
      if (data.commissions && data.commissions.length > 0) {
        successMessage += `\n\n🎉 COMMISSIONS DISTRIBUTED:\n`;
        successMessage += `Total Paid: $${data.totalCommissionsPaid}\n`;
        successMessage += `Recipients: ${data.commissions.length} sponsors\n\n`;

        data.commissions.forEach((commission) => {
          successMessage += `Level ${commission.level}: ${commission.sponsorName} (${commission.sponsorId})\n`;
          successMessage += `  💰 ${commission.commissionRate} = $${commission.commissionAmount}\n`;
        });
      }
      
      alert(successMessage + `\n\nNext NFT will unlock tomorrow.`);
      
      // Refresh dashboard data to update wallet balance display
      setTimeout(() => {
        fetchDashboardData();
      }, 2000);
    } catch (e) {
      alert(e.message || 'Purchase failed');
    }
  };

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
            <button 
              onClick={async () => {
                console.log('Debug Info:', {
                  token: token ? 'Present' : 'Missing',
                  isAuthenticated,
                  user: user?.memberId || 'No user',
                  timestamp: new Date().toISOString()
                });
                alert(`Debug Info:\nToken: ${token ? 'Present' : 'Missing'}\nAuthenticated: ${isAuthenticated}\nUser: ${user?.memberId || 'No user'}`);
              }}
              className="btn-enhanced px-4 py-2 text-white hover-bounce text-sm"
            >
              Debug
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

        {/* NFT Purchase Section (A1..J1) */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-white">Daily NFT Series</h2>
          <p className="text-sm mb-6" style={{color:'rgba(255,255,255,0.7)'}}>
            Buy NFTs in order from A1 to J1. After buying one, the next NFT becomes available the following day.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {NFT_SERIES.map((code) => {
              const status = getNftStatus(code);
              const owned = status.owned;
              const available = status.available;
              const locked = status.locked;
              return (
                <div key={code} className="p-4 rounded-2xl border hover-lift-enhanced animate-fadeInUp" style={{backgroundColor:'rgba(0,0,0,0.1)', backdropFilter:'blur(10px)', borderColor:'var(--default-border)'}}>
                  <div className="w-full aspect-square relative mb-3 overflow-hidden rounded-xl">
                    <Image src={NFT_IMAGES[code] || '/logo.png'} alt={`${code} NFT`} fill sizes="200px" className="object-contain" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-semibold">{code}</div>
                    {owned && (
                      <span className="text-xs px-2 py-1 rounded" style={{background:'rgba(34,197,94,0.15)', color:'rgb(34,197,94)', border:'1px solid rgba(34,197,94,0.3)'}}>Owned</span>
                    )}
                    {!owned && locked && (
                      <span className="text-xs px-2 py-1 rounded" style={{background:'rgba(148,163,184,0.15)', color:'rgb(148,163,184)', border:'1px solid rgba(148,163,184,0.3)'}}>Locked</span>
                    )}
                    {!owned && available && (
                      <span className="text-xs px-2 py-1 rounded" style={{background:'rgba(59,130,246,0.15)', color:'rgb(59,130,246)', border:'1px solid rgba(59,130,246,0.3)'}}>Available</span>
                    )}
                  </div>
                  
                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyNft(code)}
                    disabled={!available}
                    className="w-full py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                    style={{
                      backgroundColor: available ? 'rgba(29, 68, 67, 0.8)' : 'rgba(255,255,255,0.1)',
                      border: '1px solid var(--default-border)'
                    }}
                  >
                    {owned ? `Purchased ${code}` : available ? `Buy ${code}` : `Buy ${code}`}
                  </button>
                  
                  {/* View Series Button */}
                  <Link href={`/nft/${code}`} className="block">
                    <div className="w-full py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 text-center hover:bg-opacity-80" style={{
                      backgroundColor: 'rgba(59,130,246,0.6)',
                      border: '1px solid rgba(59,130,246,0.3)'
                    }}>
                      View {code} Series
                    </div>
                  </Link>
                  
                  {!available && !owned && (
                    <p className="mt-2 text-xs text-center" style={{color:'rgba(255,255,255,0.6)'}}>
                      Buy previous NFT first and wait 1 day.
                    </p>
                  )}
                  {owned && (
                    <p className="mt-2 text-xs text-center" style={{color:'rgba(34,197,94,0.8)'}}>
                      Click &quot;View Series&quot; to see A2-A100 NFTs
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
