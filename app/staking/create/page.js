'use client';

import { useState } from 'react';

const StakingCreatePage = () => {
  const [formData, setFormData] = useState({
    memberId: 'DGT123456',
    amount: '',
    transactionPassword: ''
  });

  const [depositWallet] = useState('$0.00');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Staking form submitted:', formData);
    // Add your staking creation logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Staking Creation</h1>
          <p className="text-lg text-gray-300">Create your staking</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Create Staking Form</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member ID */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Member ID
              </label>
              <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                <div className="text-white font-semibold text-lg">{formData.memberId}</div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white font-semibold">
                  $
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter Amount"
                  className="w-full pl-8 pr-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Deposit Wallet */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Deposit Wallet
              </label>
              <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-lg">$</span>
                  <span className="text-white font-semibold text-lg">{depositWallet}</span>
                </div>
              </div>
            </div>

            {/* Transaction Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Transaction Password
              </label>
              <input
                type="password"
                name="transactionPassword"
                value={formData.transactionPassword}
                onChange={handleInputChange}
                placeholder="Enter Transaction Password"
                className="w-full px-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                Create Staking
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/30 to-purple-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Staking Information</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span>Minimum Staking Amount:</span>
              <span className="text-cyan-400 font-medium">$100</span>
            </div>
            <div className="flex justify-between">
              <span>Staking Period:</span>
              <span className="text-purple-400 font-medium">30 Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingCreatePage;
