"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Binance coin data
const BINANCE_COIN = {
  symbol: "BNB",
  name: "Binance Coin",
  binanceSymbol: "bnbusdt",
};

function SwapPage() {
  const { token, updateUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bnbPrice, setBnbPrice] = useState(0);
  const [bnbChange, setBnbChange] = useState(0);
  const [isPositive, setIsPositive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [error, setError] = useState(null);
  const [swapType, setSwapType] = useState("buy"); // 'buy' or 'sell'
  const [amount, setAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("100.00"); // Default $100
  const [packages, setPackages] = useState(1); // Number of $100 packages
  const [loading, setLoading] = useState(true);
  const [dailyBuyCount, setDailyBuyCount] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [bnbBalance, setBnbBalance] = useState("0.0000");

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection for BNB price
  const initializeWebSocket = useCallback(() => {
    try {
      const wsUrl = `wss://stream.binance.com:9443/ws/${BINANCE_COIN.binanceSymbol}@ticker`;

      console.log("Connecting to BNB WebSocket:", wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("BNB WebSocket connected successfully");
        setConnectionStatus("Connected");
        setError(null);
        setLoading(false);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.c && data.P) {
            const currentPrice = parseFloat(data.c);
            const priceChange = parseFloat(data.P);

            setBnbPrice(currentPrice);
            setBnbChange(priceChange);
            setIsPositive(priceChange >= 0);
          }
        } catch (parseError) {
          console.error("Error parsing BNB WebSocket message:", parseError);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("BNB WebSocket error:", error);
        setError("Connection error");
        setConnectionStatus("Error");
      };

      wsRef.current.onclose = (event) => {
        console.log("BNB WebSocket closed:", event.code, event.reason);
        setConnectionStatus("Disconnected");

        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect BNB WebSocket...");
            initializeWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      console.error("Error initializing BNB WebSocket:", error);
      setError("Failed to initialize connection");
      setConnectionStatus("Error");
    }
  }, []);

  // Calculate amounts based on input
  useEffect(() => {
    if (swapType === "buy") {
      // For buying, calculate based on packages
      const totalUsd = packages * 100;
      setUsdAmount(totalUsd.toFixed(2));
      if (bnbPrice) {
        setAmount((totalUsd / bnbPrice).toFixed(6));
      }
    } else {
      // For selling, calculate based on BNB amount
      if (amount && bnbPrice) {
        setUsdAmount((parseFloat(amount) * bnbPrice).toFixed(2));
      } else {
        setUsdAmount("");
      }
    }
  }, [amount, bnbPrice, swapType, packages]);

  // Validate buy rules
  const validateBuyRules = (packageCount) => {
    setValidationError("");

    if (swapType === "buy") {
      // Minimum 1 package
      if (packageCount < 1) {
        setValidationError("Minimum 1 package required");
        return false;
      }

      // Max 10 packages
      if (packageCount > 10) {
        setValidationError("Maximum 10 packages allowed");
        return false;
      }

      // Max 10 buys per day
      if (dailyBuyCount >= 10) {
        setValidationError("Maximum 10 buys per day allowed");
        return false;
      }
    }

    return true;
  };

  // Check if wallet is connected
  const checkWalletConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          await getBnbBalance(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  }, []);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, [checkWalletConnection]);

  // Get BNB balance
  const getBnbBalance = async (address) => {
    try {
      const result = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      const balance = parseInt(result, 16) / Math.pow(10, 18);
      setBnbBalance(balance.toFixed(4));
    } catch (error) {
      console.error("Error getting BNB balance:", error);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to connect your wallet");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        await getBnbBalance(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  // Initialize WebSocket on mount
  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeWebSocket]);

  const handleSwap = async () => {
    if (!amount || !bnbPrice) {
      alert("Please enter a valid amount");
      return;
    }

    // Validate buy rules
    if (swapType === "buy" && !validateBuyRules(packages)) {
      return;
    }

    const action = swapType === "buy" ? "Buy" : "Sell";
    const message = `${action} ${amount} BNB for $${usdAmount}?\n\nCurrent BNB Price: $${bnbPrice.toFixed(
      2
    )}`;

    if (!confirm(message)) return;

    if (swapType === "buy") {
      try {
        // Check if MetaMask is installed and connected (for UI purposes)
        if (typeof window.ethereum === "undefined") {
          alert("Please install MetaMask to purchase BNB");
          return;
        }

        // Request account access (for display purposes)
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length === 0) {
          alert("Please connect your wallet to MetaMask");
          return;
        }

        // Simulate the purchase by updating user balance in database
        if (!isAuthenticated || !token) {
          alert("Please log in to make a purchase.");
          return;
        }

        // Convert USD amount to BNB for display
        const bnbAmount = (parseFloat(usdAmount) / bnbPrice).toFixed(6);

        // Call API to simulate purchase and update balance
        const res = await fetch("/api/purchase/simulate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usdAmount: parseFloat(usdAmount),
            bnbAmount: parseFloat(bnbAmount),
            packages: packages,
            bnbPrice: bnbPrice,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Purchase failed");
          return;
        }

        // Update local state
        setDailyBuyCount((prev) => prev + 1);

        // Update user context with new balance
        if (updateUser) {
          updateUser(data.user);
        }

        // Create commission details for success message
        let commissionText = "";
        if (data.commissions && data.commissions.length > 0) {
          commissionText = `\n\n🎉 COMMISSIONS DISTRIBUTED:\n`;
          commissionText += `Total Paid: $${data.totalCommissionsPaid}\n`;
          commissionText += `Recipients: ${data.commissionsDistributed} sponsors\n\n`;

          data.commissions.forEach((commission) => {
            commissionText += `Level ${commission.level}: ${commission.sponsorName} (${commission.sponsorId})\n`;
            commissionText += `  💰 ${commission.commissionRate} = $${commission.commissionAmount}\n`;
          });
        }

        alert(
          `🎉 Purchase Successful!\n\nAmount: ${bnbAmount} BNB ($${usdAmount})\nYour Balance: $${data.user.wallet.balance.toFixed(
            2
          )}${commissionText}`
        );
      } catch (error) {
        console.error("Purchase error:", error);
        alert(`Purchase failed: ${error.message}`);
      }
    } else {
      alert(
        `Transaction initiated!\n\n${action}ing ${amount} BNB for $${usdAmount}\n\nNote: This is a demo transaction.`
      );
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--default-body-bg-color)" }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-700/5 to-teal-600/5 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Header */}
      <div
        className="relative z-10 backdrop-blur-sm border-b"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderColor: "var(--default-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-white hover-lift-enhanced transition-colors"
              style={{ color: "var(--primary-color)" }}
            >
              ← Back to Dashboard
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white gradient-text-neon animate-fadeInUp">
                🚀 PICZEL SWAP
              </h1>
              <p
                className="text-sm animate-fadeInUp"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  animationDelay: "0.2s",
                }}
              >
                Trade Binance Coin (BNB)
              </p>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BNB Price Card */}
        <div
          className="glass-enhanced hover-lift-enhanced animate-fadeInUp rounded-2xl p-6 mb-8 glow-border-blue"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2 gradient-text-neon">
                Binance Coin (BNB)
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-white animate-neonGlow">
                  ${loading ? "..." : bnbPrice.toFixed(2)}
                </div>
                <div
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    isPositive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  <span className={isPositive ? "price-up" : "price-down"}>
                    {isPositive ? "↗" : "↘"}
                  </span>
                  <span>
                    {isPositive ? "+" : ""}
                    {bnbChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-medium ${
                  connectionStatus === "Connected"
                    ? "text-green-400"
                    : connectionStatus === "Error"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {connectionStatus}
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Live Price
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection Status */}
        <div
          className="glass-enhanced hover-lift-enhanced animate-fadeInUp rounded-2xl p-6 mb-8 glow-border-green"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-4 h-4 rounded-full animate-pulse ${
                  walletConnected ? "bg-green-500" : "bg-red-500"
                }`}
                style={{
                  backgroundColor: walletConnected
                    ? "rgb(var(--success-rgb))"
                    : "rgb(var(--danger-rgb))",
                }}
              ></div>
              <div>
                <h3 className="text-lg font-semibold text-white gradient-text-neon">
                  {walletConnected
                    ? "Wallet Connected"
                    : "Wallet Not Connected"}
                </h3>
                {walletConnected && (
                  <div
                    className="text-sm"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    <div>
                      Address: {walletAddress.slice(0, 6)}...
                      {walletAddress.slice(-4)}
                    </div>
                    <div>BNB Balance: {bnbBalance} BNB</div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={connectWallet}
              disabled={walletConnected}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                walletConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                  : "btn-enhanced hover-bounce hover-glow"
              }`}
            >
              {walletConnected ? "Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>

        {/* Swap Interface */}
        <div
          className="glass-enhanced hover-lift-enhanced animate-fadeInUp rounded-2xl p-8 glow-border"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="max-w-md mx-auto">
            {/* Swap Type Toggle */}
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            >
              <button
                onClick={() => setSwapType("buy")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  swapType === "buy"
                    ? "btn-enhanced shadow-lg hover-bounce"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Buy BNB
              </button>
              <button
                onClick={() => setSwapType("sell")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  swapType === "sell"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover-bounce"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Sell BNB
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-4">
              {swapType === "buy" ? (
                <>
                  {/* Packages Input for Buy */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Packages ($100 each)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={packages}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setPackages(value);
                          validateBuyRules(value);
                        }}
                        placeholder="1"
                        className="w-full text-white px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 glass-card"
                        style={{
                          backgroundColor: "var(--card-bg)",
                          borderColor: "var(--default-border)",
                        }}
                      />
                      <div
                        className="absolute right-3 top-3 text-sm"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        packages
                      </div>
                    </div>
                  </div>

                  {/* USD Amount (calculated) */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Total USD Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={usdAmount}
                        readOnly
                        className="w-full text-white px-4 py-3 rounded-xl border cursor-not-allowed"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderColor: "var(--default-border)",
                        }}
                      />
                      <div
                        className="absolute right-3 top-3 text-sm"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        USD
                      </div>
                    </div>
                  </div>

                  {/* BNB Amount (calculated) */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      BNB Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={amount}
                        readOnly
                        className="w-full text-white px-4 py-3 rounded-xl border cursor-not-allowed"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderColor: "var(--default-border)",
                        }}
                      />
                      <div
                        className="absolute right-3 top-3 text-sm"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        BNB
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* BNB Amount for Sell */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      BNB Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.000000"
                        className="w-full text-white px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 glass-card"
                        style={{
                          backgroundColor: "var(--card-bg)",
                          borderColor: "var(--default-border)",
                        }}
                      />
                      <div
                        className="absolute right-3 top-3 text-sm"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        BNB
                      </div>
                    </div>
                  </div>

                  {/* USD Amount (calculated) */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      USD Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={usdAmount}
                        readOnly
                        className="w-full text-white px-4 py-3 rounded-xl border cursor-not-allowed"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderColor: "var(--default-border)",
                        }}
                      />
                      <div
                        className="absolute right-3 top-3 text-sm"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        USD
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Validation Error */}
            {validationError && (
              <div
                className="mt-4 p-3 rounded-lg glass-card"
                style={{
                  backgroundColor: "rgba(255, 74, 74, 0.1)",
                  borderColor: "rgba(255, 74, 74, 0.3)",
                }}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: "rgb(var(--danger-rgb))" }}
                  >
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "rgb(var(--danger-rgb))" }}
                  >
                    {validationError}
                  </span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={
                !amount ||
                !bnbPrice ||
                loading ||
                validationError ||
                (swapType === "buy" && !walletConnected)
              }
              className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                swapType === "buy"
                  ? "btn-enhanced hover-bounce hover-glow shadow-lg"
                  : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-red-500/25 hover-bounce"
              } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
            >
              {loading
                ? "Loading..."
                : swapType === "buy" && !walletConnected
                ? "Connect Wallet to Buy"
                : `${swapType === "buy" ? "Buy" : "Sell"} BNB`}
            </button>

            {/* Price Info */}
            {bnbPrice && (
              <div
                className="mt-4 text-center text-sm"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                1 BNB = ${bnbPrice.toFixed(2)} USD
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div
            className="glass-enhanced hover-lift-enhanced animate-fadeInUp rounded-2xl p-6 glow-border-blue"
            style={{ animationDelay: "0.4s" }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 gradient-text-neon">
              📈 Trading Info
            </h3>
            <div
              className="space-y-2 text-sm"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              <div>• Real-time BNB prices from Binance</div>
              <div>• Instant price calculations</div>
              <div>• Live market data updates</div>
              <div>• Secure trading interface</div>
            </div>
          </div>

          <div
            className="glass-enhanced hover-lift-enhanced animate-fadeInUp rounded-2xl p-6 glow-border-yellow"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 gradient-text-neon">
              💰 Buying Rules
            </h3>
            <div
              className="space-y-2 text-sm"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              <div>• Each package: $100</div>
              <div>• Minimum: 1 package</div>
              <div>• Maximum: 10 packages</div>
              <div>• Max 10 buys per day</div>
              <div>• Daily buys: {dailyBuyCount}/10</div>
              <div>• Must be logged in to buy</div>
            </div>
          </div>

          <div
            className="glass-enhanced hover-lift-enhanced animate-fadeInUp rounded-2xl p-6 glow-border-green"
            style={{ animationDelay: "0.6s" }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 gradient-text-neon">
              🔗 MetaMask Integration
            </h3>
            <div
              className="space-y-2 text-sm"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              <div>• Real BNB transactions via MetaMask</div>
              <div>• BSC Testnet integration</div>
              <div>• Automatic network switching</div>
              <div>• Transaction confirmation tracking</div>
              <div>• Real-time BNB balance display</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwapPage;
