"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const WalletMainPage = () => {
  const { user, token } = useAuth();
  const [walletData, setWalletData] = useState({
    balance: 0,
    withdrawalBalance: 0,
    sponsorIncome: 0,
    spotIncome: 0,
    totalIncome: 0,
    totalWithdrawal: 0,
    todaysWithdrawal: 0,
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    usdtAmount: "",
    usdgAmount: "",
    transactionPassword: "",
  });

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!token) return;

      try {
        const balanceResponse = await fetch('/api/wallet/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setWalletData(prev => ({
            ...prev,
            balance: balanceData.balance || 0,
            withdrawalBalance: balanceData.withdrawalBalance || 0,
            sponsorIncome: balanceData.sponsorIncome || 0,
            spotIncome: balanceData.spotIncome || 0,
            totalIncome: (balanceData.sponsorIncome || 0) + (balanceData.spotIncome || 0),
          }));
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchWalletData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    console.log("Withdrawal form submitted:", withdrawalForm);
    // Add your withdrawal logic here
  };

  return (
    <div
      className="min-h-screen flex p-8"
      style={{
        background:
          "linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)",
        fontFamily: "var(--default-font-family)",
      }}
    >
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">
              Wallet
            </h1>
            <p
              className="text-lg animate-fadeInUp"
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                animationDelay: "0.2s",
              }}
            >
              PICZEL Wallet Balance
            </p>
          </div>

          {/* Wallet Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Main Balance */}
            <div
              className="rounded-2xl p-6 shadow-lg transition-all duration-200"
              style={{
                background:
                  "linear-gradient(to right, rgba(var(--primary-rgb), 0.2), rgba(var(--secondary-rgb), 0.1))",
                border: "1px solid rgba(var(--primary-rgb), 0.3)",
              }}
            >
              <div className="text-center">
                <div
                  className="text-sm mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  PICZEL Wallet Balance
                </div>
                <div className="text-white font-bold text-2xl">
                  ${walletData.balance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Total Income */}
            <div
              className="rounded-2xl p-6 shadow-lg transition-all duration-200"
              style={{
                background:
                  "linear-gradient(to right, rgba(var(--success-rgb), 0.2), rgba(var(--success-rgb), 0.1))",
                border: "1px solid rgba(var(--success-rgb), 0.3)",
              }}
            >
              <div className="text-center">
                <div
                  className="text-sm mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Total Income
                </div>
                <div
                  className="font-bold text-2xl"
                  style={{ color: "rgb(var(--success-rgb))" }}
                >
                  ${walletData.totalIncome.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Total Withdrawal */}
            <div
              className="rounded-2xl p-6 shadow-lg transition-all duration-200"
              style={{
                background:
                  "linear-gradient(to right, rgba(var(--danger-rgb), 0.2), rgba(var(--danger-rgb), 0.1))",
                border: "1px solid rgba(var(--danger-rgb), 0.3)",
              }}
            >
              <div className="text-center">
                <div
                  className="text-sm mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Total Withdrawal
                </div>
                <div
                  className="font-bold text-2xl"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  ${walletData.totalWithdrawal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Today's Withdrawal */}
            <div
              className="rounded-2xl p-6 shadow-lg transition-all duration-200"
              style={{
                background:
                  "linear-gradient(to right, rgba(var(--warning-rgb), 0.2), rgba(var(--warning-rgb), 0.1))",
                border: "1px solid rgba(var(--warning-rgb), 0.3)",
              }}
            >
              <div className="text-center">
                <div
                  className="text-sm mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Today&apos;s Withdrawal
                </div>
                <div
                  className="font-bold text-2xl"
                  style={{ color: "rgb(var(--warning-rgb))" }}
                >
                  ${walletData.todaysWithdrawal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div
            className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">
              Withdrawal Form
            </h2>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
              {/* USDT Amount */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  USDT Amount
                </label>
                <input
                  type="number"
                  name="usdtAmount"
                  value={withdrawalForm.usdtAmount}
                  onChange={handleInputChange}
                  placeholder="Enter USDT Amount"
                  className="w-full px-4 py-4 text-white rounded-lg text-base focus:outline-none transition-colors placeholder-gray-400"
                  style={{
                    backgroundColor: "rgba(29, 68, 67, 0.8)",
                    border: "1px solid var(--default-border)",
                    focusRingColor: "var(--primary-color)",
                  }}
                  required
                />
              </div>

              {/* USDG Amount */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  USDG Amount
                </label>
                <input
                  type="number"
                  name="usdgAmount"
                  value={withdrawalForm.usdgAmount}
                  onChange={handleInputChange}
                  placeholder="Enter USDG Amount"
                  className="w-full px-4 py-4 text-white rounded-lg text-base focus:outline-none transition-colors placeholder-gray-400"
                  style={{
                    backgroundColor: "rgba(29, 68, 67, 0.8)",
                    border: "1px solid var(--default-border)",
                    focusRingColor: "var(--primary-color)",
                  }}
                  required
                />
              </div>

              {/* Transaction Password */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Transaction Password
                </label>
                <input
                  type="password"
                  name="transactionPassword"
                  value={withdrawalForm.transactionPassword}
                  onChange={handleInputChange}
                  placeholder="Enter Transaction Password"
                  className="w-full px-4 py-4 text-white rounded-lg text-base focus:outline-none transition-colors placeholder-gray-400"
                  style={{
                    backgroundColor: "rgba(29, 68, 67, 0.8)",
                    border: "1px solid var(--default-border)",
                    focusRingColor: "var(--primary-color)",
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
                  Process Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletMainPage;
