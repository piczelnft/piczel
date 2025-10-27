'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '../../lib/auth-utils';

export default function NFTBuyPage() {
  const { user, token } = useAuth();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nftPurchases, setNftPurchases] = useState([]);

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
      
      // Display success message (commission details hidden from user)
      const received = (data.userReward ?? 0).toFixed(2);
      const displayBalance = data.user?.wallet?.balance || data.user?.walletBalance || 0;
      const successMessage = `🎉 Purchase Successful!\n\nNFT: ${code}\nYou received: $${received}\nYour Balance: $${Number(displayBalance).toFixed(2)}\n\nNext NFT will unlock tomorrow.`;
      
      alert(successMessage);
      
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
          <p>Loading NFT Collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn-enhanced px-4 py-2 text-white hover-bounce"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = dashboardData;

  return (
    <div className="relative overflow-hidden min-h-screen pt-20 lg:pt-0">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle" style={{top: '10%', left: '10%'}}></div>
        <div className="particle" style={{top: '20%', left: '80%'}}></div>
        <div className="particle" style={{top: '60%', left: '20%'}}></div>
        <div className="particle" style={{top: '80%', left: '70%'}}></div>
        <div className="particle" style={{top: '40%', left: '90%'}}></div>
        
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-700/5 to-teal-600/5 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-4 sm:pt-8 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <Link 
                href="/"
                className="inline-flex items-center text-white hover:text-cyan-400 transition-colors duration-200 mb-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white gradient-text-enhanced">
                NFT Collection
              </h1>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">
                Buy NFTs in order from A1 to J1. After buying one, the next NFT becomes available the following day.
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Purchase Wallet */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border hover-lift-enhanced" style={{backgroundColor:'rgba(0,0,0,0.1)', backdropFilter:'blur(10px)', borderColor:'var(--default-border)'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">Purchase Wallet</h3>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(59,130,246,0.2)', border:'1px solid rgba(59,130,246,0.3)'}}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
              ${(nftPurchases.length * 100).toFixed(2)}
            </div>
            <p className="text-sm text-gray-400">
              $100 per NFT purchased ({nftPurchases.length} NFTs)
            </p>
          </div>

          {/* Holding Wallet */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border hover-lift-enhanced" style={{backgroundColor:'rgba(0,0,0,0.1)', backdropFilter:'blur(10px)', borderColor:'var(--default-border)'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">Holding Wallet</h3>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(34,197,94,0.2)', border:'1px solid rgba(34,197,94,0.3)'}}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
              ${(() => {
                const totalPurchased = nftPurchases.length * 100;
                const profit = nftPurchases.length * 5; // $5 profit per NFT
                const profitAfterTax = profit - (profit * 0.25); // 25% tax on profit
                return (totalPurchased + profitAfterTax).toFixed(2);
              })()}
            </div>
            <p className="text-sm text-gray-400">
              NFT value + profit (after 25% tax)
            </p>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {NFT_SERIES.map((code) => {
            const status = getNftStatus(code);
            const owned = status.owned;
            const available = status.available;
            const locked = status.locked;
            return (
              <div key={code} className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border hover-lift-enhanced animate-fadeInUp" style={{backgroundColor:'rgba(0,0,0,0.1)', backdropFilter:'blur(10px)', borderColor:'var(--default-border)'}}>
                <div className="w-full aspect-square relative mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl">
                  <Image src={NFT_IMAGES[code] || '/logo.png'} alt={`${code} NFT`} fill sizes="200px" className="object-contain" />
                </div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-white font-semibold text-sm sm:text-base">{code}</div>
                  {owned && (
                    <span className="text-xs px-1 sm:px-2 py-1 rounded" style={{background:'rgba(34,197,94,0.15)', color:'rgb(34,197,94)', border:'1px solid rgba(34,197,94,0.3)'}}>Owned</span>
                  )}
                  {!owned && locked && (
                    <span className="text-xs px-1 sm:px-2 py-1 rounded" style={{background:'rgba(148,163,184,0.15)', color:'rgb(148,163,184)', border:'1px solid rgba(148,163,184,0.3)'}}>Locked</span>
                  )}
                  {!owned && available && (
                    <span className="text-xs px-1 sm:px-2 py-1 rounded" style={{background:'rgba(59,130,246,0.15)', color:'rgb(59,130,246)', border:'1px solid rgba(59,130,246,0.3)'}}>Available</span>
                  )}
                </div>
                
                {/* Buy Button */}
                <button
                  onClick={() => handleBuyNft(code)}
                  disabled={!available}
                  className="w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-1 sm:mb-2"
                  style={{
                    backgroundColor: available ? 'rgba(29, 68, 67, 0.8)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--default-border)'
                  }}
                >
                  {owned ? `Purchased ${code}` : available ? `Buy ${code}` : `Buy ${code}`}
                </button>
                
                {/* View Series Button */}
                <Link href={`/nft/${code}`} className="block">
                  <div className="w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition-all duration-200 text-center hover:bg-opacity-80" style={{
                    backgroundColor: 'rgba(59,130,246,0.6)',
                    border: '1px solid rgba(59,130,246,0.3)'
                  }}>
                    View {code} Series
                  </div>
                </Link>
                
                {!available && !owned && (
                  <p className="mt-1 sm:mt-2 text-xs text-center" style={{color:'rgba(255,255,255,0.6)'}}>
                    Buy previous NFT first and wait 1 day.
                  </p>
                )}
                {owned && (
                  <p className="mt-1 sm:mt-2 text-xs text-center" style={{color:'rgba(34,197,94,0.8)'}}>
                    Click &quot;View Series&quot; to see A2-A100 NFTs
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Collection Summary</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">{nftPurchases.length}</div>
              <div className="text-xs sm:text-sm text-gray-400">Owned</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {NFT_SERIES.filter(code => getNftStatus(code).available).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Available</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-400">
                {NFT_SERIES.filter(code => getNftStatus(code).locked).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Locked</div>
            </div>
          </div>
        </div>

        {/* NFT Purchase History */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Purchase History</h3>
          {nftPurchases.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(148,163,184,0.1)', border:'1px solid rgba(148,163,184,0.2)'}}>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">No NFTs purchased yet</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Start by purchasing A1 NFT</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nftPurchases
                .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
                .map((purchase, index) => (
                <div key={`${purchase.code}-${purchase.purchasedAt}`} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{backgroundColor:'rgba(255,255,255,0.02)', borderColor:'var(--default-border)'}}>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image 
                        src={NFT_IMAGES[purchase.code] || '/logo.png'} 
                        alt={`${purchase.code} NFT`} 
                        width={48} 
                        height={48} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">{purchase.code}</div>
                      <div className="text-gray-400 text-xs sm:text-sm">
                        {new Date(purchase.purchasedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold text-sm sm:text-base">$100.00</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Purchase Price</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
