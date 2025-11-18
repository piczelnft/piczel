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
      <div className="min-h-screen flex items-center justify-center" style={{background: '#fff', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-center">
          <div className="mb-8">
            <div className="text-8xl mb-4">🔒</div>
            <h1 className="text-4xl font-bold mb-4" style={{color: '#1565c0'}}>Authentication Required</h1>
            <p className="text-lg" style={{color: '#64b5f6'}}>Please log in to view your NFT purchase history.</p>
          </div>
          <a 
            href="/login" 
            className="px-6 py-3 rounded-lg bg-[#1565c0] text-white font-semibold hover:bg-[#1976d2] transition-all duration-200 inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: '#fff', fontFamily: 'var(--default-font-family)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{color: '#1565c0'}}>NFT Purchase History</h1>
          <p style={{color: '#64b5f6'}}>View all your purchased NFTs</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#1565c0'}}></div>
              <p style={{color: '#64b5f6'}}>Loading your NFT purchases...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4" style={{color: '#1565c0'}}>Error Loading NFT History</h2>
            <p className="mb-6" style={{color: '#64b5f6'}}>{error}</p>
            <button 
              onClick={fetchNftPurchases}
              className="px-6 py-3 rounded-lg bg-[#1565c0] text-white font-semibold hover:bg-[#1976d2] transition-all duration-200 inline-block"
            >
              Try Again
            </button>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-4" style={{color: '#1565c0'}}>No NFT Purchases Found</h2>
            <p className="mb-6" style={{color: '#64b5f6'}}>You haven&apos;t purchased any NFTs yet.</p>
            <a 
              href="/nft-buy" 
              className="px-6 py-3 rounded-lg bg-[#1565c0] text-white font-semibold hover:bg-[#1976d2] transition-all duration-200 inline-block"
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
              <div key={purchase._id} className="bg-[#1565c0] rounded-lg p-6 border border-blue-800 hover:bg-[#1976d2] transition-all duration-300">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-white">{purchase.series}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      purchase.payoutStatus === 'paid' 
                        ? 'bg-green-600 text-white border border-green-400' 
                        : 'bg-yellow-500 text-white border border-yellow-300'
                    }`}>
                      {purchase.payoutStatus === 'paid' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm mb-2">Code: {purchase.code}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Price:</span>
                    <span className="text-white font-semibold">${purchase.price || 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Member ID:</span>
                    <span className="text-white">{purchase.memberId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Purchased:</span>
                    <span className="text-white">{formatDate(purchase.purchasedAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-200">Purchase ID</span>
                    <span className="text-xs text-blue-100 font-mono">{purchase._id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/nft-buy" 
            className="px-6 py-3 rounded-lg bg-[#1565c0] text-white font-semibold hover:bg-[#1976d2] transition-all duration-200 inline-block"
          >
            ← Back to NFT Buy
          </a>
        </div>
      </div>
    </div>
  );
}
