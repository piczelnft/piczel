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
    <div className="min-h-screen flex p-8" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member ID */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                Member ID
              </label>
              <div className="rounded-lg p-4 transition-all duration-200" style={{
                background: 'linear-gradient(to right, rgba(var(--success-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
                border: '1px solid rgba(var(--success-rgb), 0.3)'
              }}>
                <div className="text-white font-semibold text-lg">{formData.memberId}</div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
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
                  className="w-full pl-8 pr-4 py-4 text-white rounded-lg text-base focus:outline-none transition-colors placeholder-gray-400"
                  style={{
                    backgroundColor: 'rgba(29, 68, 67, 0.8)',
                    border: '1px solid var(--default-border)',
                    focusRingColor: 'var(--primary-color)'
                  }}
                  required
                />
              </div>
            </div>

            {/* Deposit Wallet */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                Deposit Wallet
              </label>
              <div className="rounded-lg p-4 transition-all duration-200" style={{
                background: 'linear-gradient(to right, rgba(var(--primary-rgb), 0.2), rgba(var(--secondary-rgb), 0.1))',
                border: '1px solid rgba(var(--primary-rgb), 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-lg">$</span>
                  <span className="text-white font-semibold text-lg">{depositWallet}</span>
                </div>
              </div>
            </div>

            {/* Transaction Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                Transaction Password
              </label>
              <input
                type="password"
                name="transactionPassword"
                value={formData.transactionPassword}
                onChange={handleInputChange}
                placeholder="Enter Transaction Password"
                className="w-full px-4 py-4 text-white rounded-lg text-base focus:outline-none transition-colors placeholder-gray-400"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)',
                  focusRingColor: 'var(--primary-color)'
                }}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="btn-enhanced w-full px-6 py-4 text-white rounded-lg text-lg font-medium transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                Create Staking
              </button>
            </div>
        </form>

        {/* Additional Info */}
        <div className="mt-8 rounded-xl p-6 transition-all duration-200" style={{
            background: 'linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
            border: '1px solid var(--default-border)'
          }}>
            <h3 className="text-lg font-semibold text-white mb-4">Staking Information</h3>
            <div className="space-y-3" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
              <div className="flex justify-between">
                <span>Minimum Staking Amount:</span>
                <span className="font-medium" style={{color: 'var(--primary-color)'}}>$100</span>
              </div>
              <div className="flex justify-between">
                <span>Staking Period:</span>
                <span className="font-medium" style={{color: 'var(--secondary-color)'}}>30 Days</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default StakingCreatePage;
