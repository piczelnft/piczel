'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function NftHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNftPurchases();
    }
  }, [isAuthenticated]);

  const fetchNftPurchases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('/api/nft/purchases', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch NFT purchases');
      }

      const data = await response.json();
      setPurchases(data.purchases || []);
      setWalletBalance(data.walletBalance || 0);
    } catch (err) {
      console.error('Error fetching NFT purchases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-center">
          <div className="mb-8">
            <div className="text-8xl mb-4">🔒</div>
            <h1 className="text-4xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-gray-300 text-lg">Please log in to view your NFT purchase history.</p>
          </div>
          <a 
            href="/login" 
            className="btn-enhanced px-6 py-3 text-white hover-bounce inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">NFT Purchase History</h1>
          <p className="text-gray-300">View all your purchased NFTs</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-300">Loading your NFT purchases...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading NFT History</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={fetchNftPurchases}
              className="btn-enhanced px-6 py-3 text-white hover-bounce inline-block"
            >
              Try Again
            </button>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-white mb-4">No NFT Purchases Found</h2>
            <p className="text-gray-300 mb-6">You haven&apos;t purchased any NFTs yet.</p>
            <a 
              href="/nft-buy" 
              className="btn-enhanced px-6 py-3 text-white hover-bounce inline-block"
            >
              Browse NFTs
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {purchases
              .slice()
              .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
              .map((purchase) => (
              <div key={purchase._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-white">{purchase.series}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      purchase.payoutStatus === 'paid' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {purchase.payoutStatus === 'paid' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">Code: {purchase.code}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white font-semibold">${purchase.price || 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member ID:</span>
                    <span className="text-white">{purchase.memberId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Purchased:</span>
                    <span className="text-white">{formatDate(purchase.purchasedAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Purchase ID</span>
                    <span className="text-xs text-gray-300 font-mono">{purchase._id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/nft-buy" 
            className="btn-enhanced px-6 py-3 text-white hover-bounce inline-block"
          >
            ← Back to NFT Buy
          </a>
        </div>
      </div>
    </div>
  );
}
