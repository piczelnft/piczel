'use client';

import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function FundManagement() {
  const [addFundsForm, setAddFundsForm] = useState({
    memberId: '',
    walletAddress: '',
    amount: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddFundsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    
    if (!addFundsForm.memberId || !addFundsForm.walletAddress || !addFundsForm.amount) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (parseFloat(addFundsForm.amount) <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('No admin token found');
      }

      const response = await fetch('/api/admin/add-funds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addFundsForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add funds');
      }

      setMessage({ type: 'success', text: `Successfully added $${addFundsForm.amount} to ${addFundsForm.memberId}` });
      setAddFundsForm({ memberId: '', walletAddress: '', amount: '' });
      
    } catch (error) {
      console.error('Error adding funds:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fund Management</h1>
        <p className="mt-2 text-gray-600">Handle financial operations and transactions</p>
      </div>

      {/* Add Funds Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Funds</h2>
            <p className="text-gray-600">Add funds to user accounts</p>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        <form onSubmit={handleAddFunds} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Member ID Field */}
            <div>
              <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-2">
                Member ID
              </label>
              <input
                type="text"
                id="memberId"
                name="memberId"
                value={addFundsForm.memberId}
                onChange={handleInputChange}
                placeholder="Enter Member ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Wallet Address Field */}
            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={addFundsForm.walletAddress}
                onChange={handleInputChange}
                placeholder="Enter wallet address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Amount Field */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={addFundsForm.amount}
                  onChange={handleInputChange}
                  placeholder="Enter $ amount to add"
                  step="0.01"
                  min="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding Funds...
                </>
              ) : (
                <>
                  <span className="mr-2">💰</span>
                  Add Funds
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      

      
    </AdminLayout>
  );
}
