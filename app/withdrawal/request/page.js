"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function WithdrawalRequestPage() {
  const [formData, setFormData] = useState({
    amount: "",
    walletAddress: "",
    paymentMethod: "crypto",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [withdrawalBalance, setWithdrawalBalance] = useState(0);
  const [walletAddresses, setWalletAddresses] = useState([]);
  const { token, user } = useAuth();

  // Fetch user balance and wallet addresses
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      try {
        // Fetch user balance
        const balanceResponse = await fetch('/api/wallet/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setUserBalance(balanceData.balance || 0);
          setWithdrawalBalance(balanceData.withdrawalBalance || 0);
        }

        // Fetch saved wallet addresses
        const walletResponse = await fetch('/api/profile/wallet', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          setWalletAddresses(walletData.addresses || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (parseFloat(formData.amount) > withdrawalBalance) {
      newErrors.amount = "Insufficient withdrawal balance";
    } else if (parseFloat(formData.amount) < 5) {
      newErrors.amount = "Minimum withdrawal amount is $5";
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    } else if (formData.walletAddress.length < 20) {
      newErrors.walletAddress = "Please enter a valid wallet address";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          walletAddress: formData.walletAddress,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Withdrawal request submitted successfully! We will process it within 24-48 hours.");
        setFormData({
          amount: "",
          walletAddress: "",
          paymentMethod: "crypto",
          notes: ""
        });
        // Update balance
        setUserBalance(prev => prev - parseFloat(formData.amount));
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.error || "Failed to submit withdrawal request" });
      }
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAmount = (percentage) => {
    const amount = (userBalance * percentage / 100).toFixed(2);
    setFormData(prev => ({ ...prev, amount }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: "" }));
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white gradient-text-enhanced mb-2">
              Request Withdrawal
            </h1>
            <p className="text-white/70">
              Withdraw your funds to your preferred wallet address
            </p>
          </div>

          {/* Balance Card */}
          <div className="card-enhanced rounded-xl p-6 mb-6" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Balance */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-1">Total Balance</h3>
                  <p className="text-2xl font-bold text-green-400">${userBalance.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(34, 197, 94, 0.2)'}}>
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Withdrawal Balance (Sponsor Commissions) */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-1">Withdrawal Balance</h3>
                  <p className="text-2xl font-bold" style={{color: 'rgb(var(--primary-rgb))'}}>${withdrawalBalance.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(0, 255, 190, 0.15)'}}>
                  <svg className="w-6 h-6" style={{color: 'var(--primary-color)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 11a4 4 0 10-8 0 4 4 0 008 0zm6-5h-3m-4 0H5m0 0H2m3 0v3m0-3V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="card-enhanced rounded-xl shadow-2xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="px-4 py-3 rounded-lg animate-fadeInUp" style={{backgroundColor: 'rgba(255, 74, 74, 0.2)', border: '1px solid rgba(255, 74, 74, 0.3)', color: 'rgb(var(--danger-rgb))'}}>
                  {errors.general}
                </div>
              )}

              {message && (
                <div className="px-4 py-3 rounded-lg animate-fadeInUp" style={{backgroundColor: 'rgba(72, 247, 104, 0.2)', border: '1px solid rgba(72, 247, 104, 0.3)', color: 'rgb(var(--success-rgb))'}}>
                  {message}
                </div>
              )}

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                  Withdrawal Amount (USD)
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="10"
                  max={withdrawalBalance}
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: 'rgba(29, 68, 67, 0.8)',
                      border: '1px solid var(--default-border)',
                      color: 'rgb(var(--default-text-color-rgb))',
                      focusRingColor: 'var(--primary-color)'
                    }}
                    placeholder="Enter amount"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">$</span>
                  </div>
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(25)}
                    className="px-3 py-1 text-xs rounded-full transition-colors duration-200"
                    style={{backgroundColor: 'rgba(0, 255, 136, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(0, 255, 136, 0.3)'}}
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(50)}
                    className="px-3 py-1 text-xs rounded-full transition-colors duration-200"
                    style={{backgroundColor: 'rgba(0, 255, 136, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(0, 255, 136, 0.3)'}}
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(75)}
                    className="px-3 py-1 text-xs rounded-full transition-colors duration-200"
                    style={{backgroundColor: 'rgba(0, 255, 136, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(0, 255, 136, 0.3)'}}
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(100)}
                    className="px-3 py-1 text-xs rounded-full transition-colors duration-200"
                    style={{backgroundColor: 'rgba(0, 255, 136, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(0, 255, 136, 0.3)'}}
                  >
                    Max
                  </button>
                </div>

                {errors.amount && (
                  <p className="mt-1 text-sm" style={{color: 'rgb(var(--danger-rgb))'}}>{errors.amount}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: 'rgba(29, 68, 67, 0.8)',
                    border: '1px solid var(--default-border)',
                    color: 'rgb(var(--default-text-color-rgb))',
                    focusRingColor: 'var(--primary-color)'
                  }}
                >
                  <option value="crypto">Cryptocurrency</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm" style={{color: 'rgb(var(--danger-rgb))'}}>{errors.paymentMethod}</p>
                )}
              </div>

              {/* Wallet Address */}
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                  Wallet Address
                </label>
                <textarea
                  id="walletAddress"
                  name="walletAddress"
                  rows="3"
                  required
                  value={formData.walletAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: 'rgba(29, 68, 67, 0.8)',
                    border: '1px solid var(--default-border)',
                    color: 'rgb(var(--default-text-color-rgb))',
                    focusRingColor: 'var(--primary-color)'
                  }}
                  placeholder="Enter your wallet address"
                />
                {errors.walletAddress && (
                  <p className="mt-1 text-sm" style={{color: 'rgb(var(--danger-rgb))'}}>{errors.walletAddress}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: 'rgba(29, 68, 67, 0.8)',
                    border: '1px solid var(--default-border)',
                    color: 'rgb(var(--default-text-color-rgb))',
                    focusRingColor: 'var(--primary-color)'
                  }}
                  placeholder="Any additional notes for this withdrawal"
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || userBalance < 10}
                  className="btn-enhanced w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Submit Withdrawal Request"
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="text-center">
                <p className="text-sm" style={{color: 'rgba(255, 255, 255, 0.6)'}}>
                  Minimum withdrawal: $5 | Processing time: 24-48 hours | Only 1 withdrawal per day
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
