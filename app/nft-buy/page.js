'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '../../lib/auth-utils';

// Payment recipient wallet address
const PAYMENT_RECIPIENT = "0xf5993810E11c280D9B4382392E4E46D032782042";

export default function NFTBuyPage() {
  const { user, token } = useAuth();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const { walletAddress, isConnected, connectWallet, sendUSDT, getUSDTBalance, networkName, isLoading: walletLoading, error: walletError } = useWallet();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nftPurchases, setNftPurchases] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState(null);

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
      setDashboardLoading(true);
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
      setDashboardLoading(false);
    }
  }, [token]);

  // Fetch USDT balance when wallet is connected
  const fetchUSDTBalance = useCallback(async () => {
    if (isConnected && getUSDTBalance) {
      const result = await getUSDTBalance();
      if (result.success) {
        setUsdtBalance(result.balance);
      }
    }
  }, [isConnected, getUSDTBalance]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token, fetchDashboardData]);

  useEffect(() => {
    if (isConnected) {
      fetchUSDTBalance();
    }
  }, [isConnected, fetchUSDTBalance]);

  // ===== NFT Series (A1..J1) sequential daily gating =====

  const fetchNftPurchases = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/nft/purchases', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.purchases) ? data.purchases : [];
      setNftPurchases(list.map(p => ({ 
        code: p.code, 
        purchasedAt: p.purchasedAt,
        payoutStatus: p.payoutStatus || 'pending'
      })));
    } catch {
      // ignore silently for purchases list; page can still render
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    fetchNftPurchases();
  }, [isAuthenticated, token, fetchNftPurchases]);

  const getNftStatus = (code) => {
    const targetIdx = NFT_SERIES.findIndex(c => c === code);
    if (targetIdx === -1) return { owned: false, available: false, locked: true }; // Should not happen

    const isOwned = nftPurchases.some(p => p.code === code);
    if (isOwned) {
      return { owned: true, available: false, locked: false };
    }

    // For A1, it's always available if not owned
    if (code === 'A1') {
      return { owned: false, available: true, locked: false };
    }

    // For subsequent NFTs, check the preceding one
    const previousNftCode = NFT_SERIES[targetIdx - 1];
    const previousNftPurchase = nftPurchases.find(p => p.code === previousNftCode);

    if (!previousNftPurchase) {
      return { owned: false, available: false, locked: true }; // Previous not purchased, so locked
    }

    const lastPurchaseTime = new Date(previousNftPurchase.purchasedAt).getTime();
    const now = Date.now();
    const diffMs = now - lastPurchaseTime;
    const twentyFourHoursPassed = diffMs >= 24 * 60 * 60 * 1000;

    if (twentyFourHoursPassed) {
      return { owned: false, available: true, locked: false };
    } else {
      return { owned: false, available: false, locked: true };
    }
  };

  const handleBuyNft = async (code) => {
    const status = getNftStatus(code);
    if (!status.available) return;
    
    try {
      if (!token) {
        alert('Please log in to make a purchase.');
        return;
      }

      // Check if wallet is connected
      if (!isConnected) {
        const shouldConnect = confirm(`To purchase ${code}, you need to connect your wallet and pay 100 USDT. Connect wallet now?`);
        if (!shouldConnect) return;
        
        const connectResult = await connectWallet();
        if (!connectResult.success) {
          alert(`Failed to connect wallet:\n\n${connectResult.error}\n\nPlease:\n1. Check if TokenPocket is installed\n2. Unlock your wallet\n3. Try refreshing the page`);
          return;
        }
        
        // Fetch balance after connecting
        await fetchUSDTBalance();
      }

      // Check USDT balance
      const balanceResult = await getUSDTBalance();
      const hasBalance = balanceResult.success && parseFloat(balanceResult.balance) >= 100;

      // Require sufficient balance
      if (!hasBalance) {
        const currentBalance = balanceResult.success ? balanceResult.balance : '0';
        alert(
          `⚠️ INSUFFICIENT USDT BALANCE\n\n` +
          `Your Balance: ${currentBalance} USDT\n` +
          `Required: 100 USDT\n` +
          `Network: BSC/BEP20\n\n` +
          `Please add USDT to your wallet and try again.`
        );
        return;
      }

      // Confirm purchase
      const message = `Purchase ${code} for 100 USDT?\n\nAmount: 100 USDT\nYour Balance: ${balanceResult.balance} USDT\nNetwork: BSC/BEP20\nRecipient: ${PAYMENT_RECIPIENT.slice(0, 6)}...${PAYMENT_RECIPIENT.slice(-4)}\n\nThis will open your TokenPocket wallet.`;
      
      if (!confirm(message)) return;

      setProcessingPayment(true);

      // Send USDT payment
      const paymentResult = await sendUSDT("100");
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      console.log('Payment successful:', paymentResult.txHash);

      // Get wallet address - check multiple sources
      let purchaseWalletAddress = walletAddress;
      if (!purchaseWalletAddress) {
        // Try to get from localStorage as fallback
        purchaseWalletAddress = localStorage.getItem('walletAddress');
      }
      if (!purchaseWalletAddress && window.ethereum) {
        // Try to get directly from MetaMask
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            purchaseWalletAddress = accounts[0];
          }
        } catch (err) {
          console.error('Error getting wallet address:', err);
        }
      }

      console.log('Recording purchase with wallet address:', purchaseWalletAddress);

      // Record purchase in backend with transaction hash
      const res = await fetch('/api/nft/purchases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code, 
          series: code.charAt(0), 
          purchasedAt: new Date().toISOString(),
          txHash: paymentResult.txHash,
          paymentAmount: 100,
          walletAddress: purchaseWalletAddress
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Purchase recording failed' }));
        throw new Error(data.error || 'Purchase recording failed');
      }

      const data = await res.json();
      const next = [...nftPurchases, { 
        code, 
        purchasedAt: new Date().toISOString(),
        payoutStatus: 'pending'
      }];
      setNftPurchases(next);
      
      // Display success message with transaction hash
      const successMessage = `✅ Purchase Successful!\n\nNFT: ${code}\nTransaction: ${paymentResult.txHash.slice(0, 10)}...${paymentResult.txHash.slice(-8)}\nNetwork: BSC/BEP20`;
      
      alert(successMessage);
      
      // Refresh USDT balance
      setTimeout(() => {
        fetchUSDTBalance();
      }, 2000);
      
      // Refresh dashboard data to update wallet balance display
      setTimeout(() => {
        fetchDashboardData();
      }, 2000);
    } catch (e) {
      console.error('Purchase error:', e);
      alert(e.message || 'Purchase failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#1565c0] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1565c0] mx-auto mb-4"></div>
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
        <div className="text-[#1565c0] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1565c0] mx-auto mb-4"></div>
          <p>Loading NFT Collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#1565c0] text-center max-w-md">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 rounded bg-[#1565c0] text-white font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = dashboardData;

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* All content wrapped in a single parent div to fix JSX error */}
      <div>
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <Link 
                href="/"
                className="inline-flex items-center text-[#1565c0] hover:underline transition-colors duration-200 mb-4 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="#1565c0" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              
              {/* Wallet Connection Status */}
              {isConnected && (
                <div className="mb-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-[#1565c0]">Wallet Connected</span>
                      <span className="text-xs font-mono text-gray-600">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Network: </span>
                        <span className="font-medium text-[#1565c0]">
                          {/* {networkName || 'Unknown'} */}BSC/BEP20
                          </span>
                      </div>
                      {usdtBalance !== null && (
                        <div className="text-sm">
                          <span className="text-gray-600">USDT Balance: </span>
                          <span className="font-bold text-green-600">{parseFloat(usdtBalance).toFixed(2)} USDT</span>
                        </div>
                      )}
                      <button
                        onClick={fetchUSDTBalance}
                        className="text-xs px-2 py-1 rounded bg-[#1565c0] text-white hover:bg-[#1976d2]"
                        disabled={walletLoading}
                      >
                        {walletLoading ? '⟳' : '↻'} Refresh
                      </button>
                    </div>
                  </div>
                  {usdtBalance !== null && parseFloat(usdtBalance) < 100 && (
                    <div className="mt-2 text-xs text-orange-600">
                      ⚠️ Low USDT balance. You need at least 100 USDT to purchase NFTs. Please add USDT to your wallet.
                    </div>
                  )}
                </div>
              )}
              
              {!isConnected && (
                <div className="mb-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-yellow-800">⚠️ Wallet not connected. Connect to purchase NFTs with USDT.</span>
                    </div>
                    <button
                      onClick={connectWallet}
                      className="text-sm px-4 py-2 rounded bg-[#1565c0] text-white hover:bg-[#1976d2] font-semibold"
                      disabled={walletLoading}
                    >
                      {walletLoading ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1565c0]">
                  Meme NFT Collection
                </h1>
                <p className="text-[#1565c0] mt-2 text-sm sm:text-base">
                  Buy NFTs in order from A1 to J1. After buying one, the next NFT becomes available in 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Summary Cards for A1-A100, B1-B100, ..., J1-J100 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Total NFT Purchased Amount (A1-A100, B1-B100, ..., J1-J100) */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-white">Total NFT Purchased Amount</h3>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{backgroundColor:'#fff', border:'1px solid #1565c0'}}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1565c0]" fill="none" stroke="#1565c0" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              ${(() => {
                // All A1-A100, B1-B100, ..., J1-J100
                const allSeriesPurchases = nftPurchases.filter(p => {
                  const code = p.code;
                  const series = code.charAt(0);
                  const number = parseInt(code.substring(1));
                  return (series >= 'A' && series <= 'J' && number >= 1 && number <= 100);
                });
                return (allSeriesPurchases.length * 100).toFixed(2);
              })()}
            </div>
            <p className="text-sm text-gray-400">
              $100 per NFT purchased ({(() => {
                const allSeriesPurchases = nftPurchases.filter(p => {
                  const code = p.code;
                  const series = code.charAt(0);
                  const number = parseInt(code.substring(1));
                  return (series >= 'A' && series <= 'J' && number >= 1 && number <= 100);
                });
                return allSeriesPurchases.length;
              })()} NFTs A1-A100, B1-B100, ..., J1-J100)
            </p>
          </div>
          {/* Total Holding Wallet (A1-A100, ..., J1-J100) */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">Total Holding Wallet</h3>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(34,197,94,0.2)', border:'1px solid rgba(34,197,94,0.3)'}}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
              ${(() => {
                // All A1-A100, ..., J1-J100, not paid
                const unpaid = nftPurchases.filter(p => {
                  const code = p.code;
                  const series = code.charAt(0);
                  const number = parseInt(code.substring(1));
                  return (series >= 'A' && series <= 'J' && number >= 1 && number <= 100 && (!p.payoutStatus || p.payoutStatus !== 'paid'));
                });
                // Use profit logic from series page
                function getProfitAmount(n) {
                  if (n === 1) return 105; // A1-J1 holding
                  if (n === 2) return 110;
                  if (n === 3) return 115;
                  if (n >= 4 && n <= 100) return 120;
                  return 0;
                }
                let total = 0;
                unpaid.forEach(p => {
                  const n = parseInt(p.code.substring(1));
                  total += getProfitAmount(n);
                });
                return total.toFixed(2);
              })()}
            </div>
            <p className="text-sm text-gray-400">
              {(() => {
                const unpaid = nftPurchases.filter(p => {
                  const code = p.code;
                  const series = code.charAt(0);
                  const number = parseInt(code.substring(1));
                  return (series >= 'A' && series <= 'J' && number >= 1 && number <= 100 && (!p.payoutStatus || p.payoutStatus !== 'paid'));
                });
                return `A1-A100, B1-B100, ..., J1-J100 holding amount  ${unpaid.length} NFT${unpaid.length === 1 ? '' : 's'}`;
              })()}
            </p>
          </div>
          {/* Total Profit Value (A1-A100, ..., J1-J100) */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">Total Profit Value</h3>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(168,85,247,0.2)', border:'1px solid rgba(168,85,247,0.3)'}}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
              ${(() => {
                // All A1-A100, ..., J1-J100, paid
                const paid = nftPurchases.filter(p => {
                  const code = p.code;
                  const series = code.charAt(0);
                  const number = parseInt(code.substring(1));
                  return (series >= 'A' && series <= 'J' && number >= 1 && number <= 100 && p.payoutStatus === 'paid');
                });
                // Use profit logic from series page
                function getProfit(n) {
                  if (n === 1) return 5;
                  if (n === 2) return 10;
                  if (n === 3) return 15;
                  if (n >= 4 && n <= 100) return 20;
                  return 0;
                }
                let total = 0;
                paid.forEach(p => {
                  const n = parseInt(p.code.substring(1));
                  total += getProfit(n);
                });
                return total.toFixed(2);
              })()}
            </div>
            <p className="text-sm text-gray-400">
              {(() => {
                const paid = nftPurchases.filter(p => {
                  const code = p.code;
                  const series = code.charAt(0);
                  const number = parseInt(code.substring(1));
                  return (series >= 'A' && series <= 'J' && number >= 1 && number <= 100 && p.payoutStatus === 'paid');
                });
                return `NFT (${paid.length} paid out)`;
              })()}
            </p>
          </div>
        </div>
          {/* Bottom Summary Cards Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Purchase Wallet */}
            <div className="flex-1 p-2 sm:p-3 rounded-lg sm:rounded-xl border" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">Total Purchase Amount</h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.2)'}}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">
              ${(() => {
                // Only count A1-J1 NFTs (number = 1)
                const a1J1Purchases = nftPurchases.filter(p => {
                  const code = p.code;
                  const number = parseInt(code.substring(1));
                  return number === 1;
                });
                return (a1J1Purchases.length * 100).toFixed(2);
              })()}
            </div>
            <p className="text-sm text-gray-400">
              $100 per NFT purchased ({(() => {
                const a1J1Purchases = nftPurchases.filter(p => {
                  const number = parseInt(p.code.substring(1));
                  return number === 1;
                });
                return a1J1Purchases.length;
              })()} A1-J1 NFTs)
            </p>
          </div>

            {/* Holding Wallet */}
            <div className="flex-1 p-2 sm:p-3 rounded-lg sm:rounded-xl border" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">Holding Wallet</h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.2)'}}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">
              ${(() => {
                // Only count A1-J1 NFTs (number = 1) and filter out paid ones
                const unpaidA1J1Purchases = nftPurchases.filter(p => {
                  const code = p.code;
                  const number = parseInt(code.substring(1));
                  return number === 1 && (!p.payoutStatus || p.payoutStatus !== 'paid');
                });
                // A1-J1: Show $105 to user ($100 purchase + $5 profit before tax)
                const holdingPerNft = 105; // Display amount (tax is hidden from user)
                return (unpaidA1J1Purchases.length * holdingPerNft).toFixed(2);
              })()}
            </div>
            <p className="text-sm text-gray-400">
              {(() => {
                const unpaidA1J1Purchases = nftPurchases.filter(p => {
                  const number = parseInt(p.code.substring(1));
                  return number === 1 && (!p.payoutStatus || p.payoutStatus !== 'paid');
                });
                return `A1-J1 holding amount  ${unpaidA1J1Purchases.length} NFT${unpaidA1J1Purchases.length === 1 ? '' : 's'}`;
              })()}
            </p>
            <div className="mt-3">
              <div 
                className="p-3 rounded-lg border"
                style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#fff'}}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">Unpaid NFTs</div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)'}}>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {(() => {
                    const unpaidA1J1Purchases = nftPurchases.filter(p => {
                      const number = parseInt(p.code.substring(1));
                      return number === 1 && (!p.payoutStatus || p.payoutStatus !== 'paid');
                    });
                    return unpaidA1J1Purchases.length;
                  })()}
                </div>
              </div>
            </div>
          </div>

            {/* Total NFT Profit */}
            <div className="flex-1 p-2 sm:p-3 rounded-lg sm:rounded-xl border" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">Total NFT Profit</h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.2)'}}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">
              ${(() => {
                // Calculate total profit from paid out NFTs
                // For A1-J1 NFTs: Purchase = $100, Holding = $105, Profit = $5 per NFT
                const paidA1J1Purchases = nftPurchases.filter(p => {
                  const code = p.code;
                  const number = parseInt(code.substring(1));
                  return number === 1 && p.payoutStatus === 'paid';
                });
                const profitPerNft = 5; // $5 profit per A1-J1 NFT after payout
                return (paidA1J1Purchases.length * profitPerNft).toFixed(2);
              })()}
            </div>
            <p className="text-sm text-gray-400">
              {(() => {
                const paidA1J1Purchases = nftPurchases.filter(p => {
                  const number = parseInt(p.code.substring(1));
                  return number === 1 && p.payoutStatus === 'paid';
                });
                return `NFT (${paidA1J1Purchases.length} paid out)`;
              })()}
            </p>
            <div className="mt-3">
              <div 
                className="p-3 rounded-lg border"
                style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#fff'}}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">Paid Out NFTs</div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{backgroundColor:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)'}}>
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {(() => {
                    const paidA1J1Purchases = nftPurchases.filter(p => {
                      const number = parseInt(p.code.substring(1));
                      return number === 1 && p.payoutStatus === 'paid';
                    });
                    return paidA1J1Purchases.length;
                  })()}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {NFT_SERIES.map((code) => {
            const status = getNftStatus(code);
            const owned = status.owned;
            const available = status.available;
            const locked = status.locked;
            return (
              <div key={code} className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border animate-fadeInUp" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
                <div className="w-full aspect-square relative mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl">
                  <Image src={NFT_IMAGES[code] || '/logo.png'} alt={`${code} NFT`} fill sizes="200px" className="object-contain" />
                </div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-white font-semibold text-sm sm:text-base">{code}</div>
                  {owned && (
                    <span className="text-xs px-1 sm:px-2 py-1 rounded bg-white text-[#1565c0] border border-[#1565c0]">Owned</span>
                  )}
                  {!owned && locked && (
                    <span className="text-xs px-1 sm:px-2 py-1 rounded bg-white text-gray-400 border border-gray-300">Locked</span>
                  )}
                  {!owned && available && (
                    <span className="text-xs px-1 sm:px-2 py-1 rounded bg-white text-[#1565c0] border border-[#1565c0]">Available</span>
                  )}
                </div>
                
                {/* Buy Button */}
                <button
                  onClick={() => handleBuyNft(code)}
                  disabled={!available}
                  className="w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-1 sm:mb-2"
                  style={{
                    backgroundColor: available ? '#fff' : '#e3e3e3',
                    color: available ? '#1565c0' : '#888',
                    border: '1px solid #1565c0',
                    fontWeight: 600
                  }}
                >
                  {owned ? `Purchased ${code}` : available ? `Buy ${code}` : `Buy ${code}`}
                </button>
                
                {/* View Series Button */}
                <Link href={`/nft/${code}`} className="block">
                  <div className="w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#1565c0] bg-white border border-[#1565c0] text-center hover:bg-[#e3f0fd] transition-all duration-200">
                    View {code} Series
                  </div>
                </Link>
                
                {!available && !owned && (
                  <p className="mt-1 sm:mt-2 text-xs text-center text-white">
                    Buy previous NFT first and wait 24 hours.
                  </p>
                )}
                {owned && (
                  <p className="mt-1 sm:mt-2 text-xs text-center text-white">
                    Click &quot;View Series&quot; to see A2-A100 NFTs
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor:'#1565c0', color:'#fff', borderColor:'#1565c0'}}>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Collection Summary</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-white">{nftPurchases.length}</div>
              <div className="text-xs sm:text-sm text-white/80">Owned</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-white">
                {NFT_SERIES.filter(code => getNftStatus(code).available).length}
              </div>
              <div className="text-xs sm:text-sm text-white/80">Available</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-white/80">
                {NFT_SERIES.filter(code => getNftStatus(code).locked).length}
              </div>
              <div className="text-xs sm:text-sm text-white/80">Locked</div>
            </div>
          </div>
        </div>

        {/* NFT Purchase History */}
        {/* <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border" style={{backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
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
        </div> */}
      </div>
    </div>
  );
}
