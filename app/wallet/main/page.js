'use client';

import { useState } from 'react';

const WalletMainPage = () => {
  const [withdrawalForm, setWithdrawalForm] = useState({
    usdtAmount: '',
    usdgAmount: '',
    transactionPassword: ''
  });

  const walletData = {
    balance: '$5528.13',
    totalIncome: '$82.19',
    totalWithdrawal: '$0',
    todaysWithdrawal: '$0'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    console.log('Withdrawal form submitted:', withdrawalForm);
    // Add your withdrawal logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-lg text-gray-300">DGTEK Wallet Balance</p>
        </div>

        {/* Wallet Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Main Balance */}
          <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-lg">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">DGTEK Wallet Balance</div>
              <div className="text-white font-bold text-2xl">{walletData.balance}</div>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-gradient-to-br from-slate-800/50 to-green-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 shadow-lg">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Total Income</div>
              <div className="text-green-400 font-bold text-2xl">{walletData.totalIncome}</div>
            </div>
          </div>

          {/* Total Withdrawal */}
          <div className="bg-gradient-to-br from-slate-800/50 to-red-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 shadow-lg">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Total Withdrawal</div>
              <div className="text-red-400 font-bold text-2xl">{walletData.totalWithdrawal}</div>
            </div>
          </div>

          {/* Today's Withdrawal */}
          <div className="bg-gradient-to-br from-slate-800/50 to-yellow-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 shadow-lg">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Today's Withdrawal</div>
              <div className="text-yellow-400 font-bold text-2xl">{walletData.todaysWithdrawal}</div>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Withdrawal Form</h2>
          
          <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
            {/* USDT Amount */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                USDT Amount
              </label>
              <input
                type="number"
                name="usdtAmount"
                value={withdrawalForm.usdtAmount}
                onChange={handleInputChange}
                placeholder="Enter USDT Amount"
                className="w-full px-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400"
                required
              />
            </div>

            {/* USDG Amount */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                USDG Amount
              </label>
              <input
                type="number"
                name="usdgAmount"
                value={withdrawalForm.usdgAmount}
                onChange={handleInputChange}
                placeholder="Enter USDG Amount"
                className="w-full px-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400"
                required
              />
            </div>

            {/* Transaction Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Transaction Password
              </label>
              <input
                type="password"
                name="transactionPassword"
                value={withdrawalForm.transactionPassword}
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
                Process Withdrawal
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default WalletMainPage;
