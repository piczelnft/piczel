'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '../../../lib/auth-utils';

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchases, setPurchases] = useState([]);

  const series = params.series; // A1, B1, C1, etc.
  const baseSeries = series?.charAt(0); // A, B, C, etc.
  const seriesNumber = series?.substring(1); // 1

  // Generate NFT codes A2-A100, B2-B100, etc.
  const generateNFTCodes = () => {
    if (!baseSeries) return [];
    const codes = [];
    for (let i = 2; i <= 100; i++) {
      codes.push(`${baseSeries}${i}`);
    }
    return codes;
  };

  const nftCodes = generateNFTCodes();

  // Image mapping - each series uses the same image as its A1, B1, C1, etc.
  const getNFTImage = (nftCode) => {
    const baseSeries = nftCode.charAt(0);
    const seriesImages = {
      'A': '/nft/1.jpg',
      'B': '/nft/2.jpg', 
      'C': '/nft/3.jpg',
      'D': '/nft/4.jpg',
      'E': '/nft/5.jpg',
      'F': '/nft/6.jpg',
      'G': '/nft/7.jpg',
      'H': '/nft/8.jpg',
      'I': '/nft/9.jpg',
      'J': '/nft/10.jpg',
    };
    return seriesImages[baseSeries] || '/logo.png';
  };

  // Wallet balance-based unlocking logic
  const getWalletThreshold = (nftCode) => {
    const number = parseInt(nftCode.substring(1));
    // A2=110, A3=115, A4=120, then all A5-A100 require $120
    if (number <= 4) {
      return (number - 1) * 5 + 110;
    } else {
      return 120; // All A5-A100 require $120
    }
  };

  const isNFTAvailable = (nftCode) => {
    const threshold = getWalletThreshold(nftCode);
    return userBalance >= threshold;
  };

  const isNFTOwned = (nftCode) => {
    return purchases.includes(nftCode);
  };

  const getNFTStatus = (nftCode) => {
    if (isNFTOwned(nftCode)) {
      return { status: 'owned', message: 'Owned' };
    }
    if (isNFTAvailable(nftCode)) {
      return { status: 'available', message: 'Available' };
    }
    const threshold = getWalletThreshold(nftCode);
    return { 
      status: 'locked', 
      message: `Need $${threshold}`,
      threshold 
    };
  };

  // Fetch user balance
  const fetchUserBalance = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserBalance(parseFloat(data.balance || 0));
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load purchases from backend
  const loadPurchases = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/nft/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      const all = Array.isArray(data.purchases) ? data.purchases : [];
      const seriesPurchases = all
        .filter(p => typeof p.code === 'string' && p.code.startsWith(baseSeries))
        .map(p => p.code);
      setPurchases(seriesPurchases);
    } catch (err) {
      console.error('Error loading purchases:', err);
    }
  }, [token, baseSeries]);

  // Handle NFT purchase
  const handlePurchase = async (nftCode) => {
    const status = getNFTStatus(nftCode);
    if (status.status !== 'available') return;

    try {
      // Confirm purchase similar to swap buy flow
      const usdPrice = getWalletThreshold(nftCode) - 5;
      const message = `Buy ${nftCode} for $${usdPrice}?`;
      if (!confirm(message)) return;

      // Require auth token
      if (!token) {
        alert('Please log in to make a purchase.');
        return;
      }

      const body = {
        code: nftCode,
        purchasedAt: new Date().toISOString(),
        series: baseSeries,
        price: getWalletThreshold(nftCode) - 5
      };
      const res = await fetch('/api/nft/purchases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Purchase failed' }));
        throw new Error(data.error || 'Purchase failed');
      }

      const data = await res.json();
      setPurchases(prev => [...prev, nftCode]);
      
      // Display success message with commission details (use server-calculated reward)
      const received = (data.userReward ?? 0).toFixed(2);
      let successMessage = `🎉 Purchase Successful!\n\nNFT: ${nftCode}\nYou received: $${received}\nYour Balance: $${data.user?.wallet?.balance?.toFixed ? data.user.wallet.balance.toFixed(2) : Number(data.user?.wallet?.balance || 0).toFixed(2)}`;
      
      if (data.commissions && data.commissions.length > 0) {
        successMessage += `\n\n🎉 COMMISSIONS DISTRIBUTED:\n`;
        successMessage += `Total Paid: $${data.totalCommissionsPaid}\n`;
        successMessage += `Recipients: ${data.commissions.length} sponsors\n\n`;

        data.commissions.forEach((commission) => {
          successMessage += `Level ${commission.level}: ${commission.sponsorName} (${commission.sponsorId})\n`;
          successMessage += `  💰 ${commission.commissionRate} = $${commission.commissionAmount}\n`;
        });
      }
      
      alert(successMessage);
      
      // Refresh the balance to update wallet balance display
      setTimeout(() => {
        fetchUserBalance();
      }, 2000);
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Purchase failed. Please try again.');
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserBalance();
      loadPurchases();
    }
  }, [isAuthenticated, token, fetchUserBalance, loadPurchases]);

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

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading NFT Series...</p>
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
            onClick={fetchUserBalance}
            className="btn-enhanced px-4 py-2 text-white hover-bounce"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
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
                {baseSeries} Series NFTs
              </h1>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">
                Available NFTs: {baseSeries}2 - {baseSeries}100
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xs sm:text-sm text-gray-400">Wallet Balance</div>
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                ${userBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {nftCodes.map((nftCode, index) => {
            const status = getNFTStatus(nftCode);
            const isOwned = status.status === 'owned';
            const isAvailable = status.status === 'available';
            const isLocked = status.status === 'locked';

            return (
              <div 
                key={nftCode} 
                className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border hover-lift-enhanced animate-fadeInUp transition-all duration-200"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  backgroundColor: 'rgba(0,0,0,0.1)', 
                  backdropFilter: 'blur(10px)', 
                  borderColor: 'var(--default-border)',
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                {/* NFT Image */}
                <div className="w-full aspect-square relative mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl">
                  <Image 
                    src={getNFTImage(nftCode)} 
                    alt={`${nftCode} NFT`} 
                    fill 
                    sizes="200px" 
                    className="object-cover" 
                  />
                  {isOwned && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                        OWNED
                      </div>
                    </div>
                  )}
                </div>

                {/* NFT Info */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-white font-semibold text-sm sm:text-lg">{nftCode}</div>
                  <div className={`text-xs px-1 sm:px-2 py-1 rounded ${
                    isOwned ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    isAvailable ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {status.message}
                  </div>
                </div>

                {/* Price Info */}
                {!isOwned && (
                  <div className="text-xs text-gray-400 mb-2 sm:mb-3">
                    Price: ${getWalletThreshold(nftCode) - 5}
                  </div>
                )}

                {/* Buy Button */}
                <button
                  onClick={() => handlePurchase(nftCode)}
                  disabled={!isAvailable}
                  className={`w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isOwned ? 'bg-green-500/20 text-green-400 cursor-default' :
                    isAvailable ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                    'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isOwned ? `Purchased` : 
                   isAvailable ? `Buy ${nftCode}` : 
                   `Locked`}
                </button>

                {/* Locked Message */}
                {isLocked && (
                  <p className="mt-1 sm:mt-2 text-xs text-gray-500 text-center">
                    Need ${status.threshold} wallet balance
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Series Summary</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">{purchases.length}</div>
              <div className="text-xs sm:text-sm text-gray-400">Owned</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {nftCodes.filter(code => getNFTStatus(code).status === 'available').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Available</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-400">
                {nftCodes.filter(code => getNFTStatus(code).status === 'locked').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Locked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
