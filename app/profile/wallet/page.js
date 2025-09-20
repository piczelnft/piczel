'use client';

import { useState } from 'react';

export default function ProfileWallet() {
  const [walletData, setWalletData] = useState({
    walletAddress: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field, value) => {
    setWalletData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically validate and save the wallet data
    console.log('Saving wallet data:', walletData);
    setIsEditing(false);
  };

  const handleCopyAddress = () => {
    if (walletData.walletAddress) {
      navigator.clipboard.writeText(walletData.walletAddress);
      // You could add a toast notification here
      alert('Wallet address copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Wallet Address</h1>
            <p className="text-gray-400">Update your Wallet Address</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Address Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Wallet Settings</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                isEditing
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Wallet'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Wallet Address Section */}
            <div className="bg-gradient-to-r from-slate-700/30 to-purple-700/30 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                💳 Wallet Address
              </h3>
              
              <div className="space-y-4">
                {/* Wallet Address Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wallet Address:
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={walletData.walletAddress}
                        onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                        placeholder="Enter wallet address"
                        className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-gray-400"
                      />
                      <p className="text-xs text-gray-400">
                        Enter your cryptocurrency wallet address (e.g., Bitcoin, Ethereum, BNB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-700/30 text-white px-4 py-3 rounded-xl border border-purple-500/20">
                        {walletData.walletAddress || 'No wallet address set'}
                      </div>
                      {walletData.walletAddress && (
                        <button
                          onClick={handleCopyAddress}
                          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Wallet Info Card */}
                {!isEditing && walletData.walletAddress && (
                  <div className="bg-gradient-to-r from-green-700/20 to-emerald-700/20 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Wallet Address Active</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      Your wallet address is ready to receive payments and transactions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Save Wallet Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            ℹ️ Important Information
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400">⚠️</span>
              <span>Make sure to enter the correct wallet address. Incorrect addresses may result in permanent loss of funds.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-400">💡</span>
              <span>Double-check the address format for your specific cryptocurrency.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-400">✅</span>
              <span>You can update your wallet address at any time through this page.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
