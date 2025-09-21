"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Binance coin data
const BINANCE_COIN = {
  symbol: "BNB",
  name: "Binance Coin",
  binanceSymbol: "bnbusdt",
};

export default function SwapPage() {
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
  const [sponsorId, setSponsorId] = useState("");
  const [sponsorValid, setSponsorValid] = useState(null); // null = unchecked, true/false = validity
  const [sponsorChecking, setSponsorChecking] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection for BNB price
  const initializeWebSocket = () => {
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
  };

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
  }, []);

  const handleSwap = async () => {
    if (!amount || !bnbPrice) {
      alert("Please enter a valid amount");
      return;
    }

    // Validate buy rules
    if (swapType === "buy" && !validateBuyRules(packages)) {
      return;
    }

    // For buy: require valid sponsor ID
    if (swapType === "buy") {
      if (!sponsorId.trim()) {
        alert("Please enter a Sponsorship ID before buying.");
        return;
      }
      if (sponsorValid !== true) {
        alert("Please validate a valid Sponsorship ID before buying.");
        return;
      }
    }

    const action = swapType === "buy" ? "Buy" : "Sell";
    const message = `${action} ${amount} BNB for $${usdAmount}?\n\nCurrent BNB Price: $${bnbPrice.toFixed(
      2
    )}`;

    if (!confirm(message)) return;

    if (swapType === "buy") {
      try {
        if (!isAuthenticated || !token) {
          alert("Please log in to buy.");
          return;
        }
        // Activate user in genealogy using sponsor memberId
        const res = await fetch("/api/purchase/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sponsorMemberId: sponsorId.trim(),
            package: `${packages}x100USD`,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Activation failed");
          return;
        }
        // Optionally refresh user from /api/auth/verify if needed
        setDailyBuyCount((prev) => prev + 1);
        alert(
          "Activation successful! Your account is now active in the genealogy tree."
        );
        router.push("/team/geneology");
      } catch (e) {
        console.error("Buy error:", e);
        alert("Network error while buying");
      }
    } else {
      alert(
        `Transaction initiated!\n\n${action}ing ${amount} BNB for $${usdAmount}\n\nNote: This is a demo transaction.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-white hover:text-cyan-400 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">🚀 DGTEK SWAP</h1>
              <p className="text-gray-300 text-sm">Trade Binance Coin (BNB)</p>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BNB Price Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Binance Coin (BNB)
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-white">
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
              <div className="text-xs text-gray-400">Live Price</div>
            </div>
          </div>
        </div>

        {/* Swap Interface */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="max-w-md mx-auto">
            {/* Swap Type Toggle */}
            <div className="flex bg-slate-700/50 rounded-xl p-1 mb-6">
              <button
                onClick={() => setSwapType("buy")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  swapType === "buy"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Buy BNB
              </button>
              <button
                onClick={() => setSwapType("sell")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  swapType === "sell"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg"
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
                  {/* Sponsorship ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sponsorship ID (required for Buy)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={sponsorId}
                        onChange={(e) => {
                          setSponsorId(e.target.value);
                          setSponsorValid(null);
                        }}
                        placeholder="Enter sponsor's ID (e.g., UABC123)"
                        className="flex-1 bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!sponsorId.trim()) return;
                          setSponsorChecking(true);
                          try {
                            const res = await fetch(
                              `/api/users/validate-sponsor?memberId=${encodeURIComponent(
                                sponsorId.trim()
                              )}`
                            );
                            const data = await res.json();
                            if (res.ok && data.valid) {
                              setSponsorValid(true);
                            } else {
                              setSponsorValid(false);
                            }
                          } catch {
                            setSponsorValid(false);
                          } finally {
                            setSponsorChecking(false);
                          }
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-cyan-600 hover:to-purple-700 transition-all"
                      >
                        {sponsorChecking ? "Checking..." : "Validate"}
                      </button>
                    </div>
                    {sponsorValid === true && (
                      <p className="mt-1 text-xs text-green-400">
                        Sponsor ID is valid.
                      </p>
                    )}
                    {sponsorValid === false && (
                      <p className="mt-1 text-xs text-red-400">
                        Invalid Sponsorship ID.
                      </p>
                    )}
                  </div>
                  {/* Packages Input for Buy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                        className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">
                        packages
                      </div>
                    </div>
                  </div>

                  {/* USD Amount (calculated) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total USD Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={usdAmount}
                        readOnly
                        className="w-full bg-slate-600/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">
                        USD
                      </div>
                    </div>
                  </div>

                  {/* BNB Amount (calculated) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      BNB Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={amount}
                        readOnly
                        className="w-full bg-slate-600/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">
                        BNB
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* BNB Amount for Sell */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      BNB Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.000000"
                        className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">
                        BNB
                      </div>
                    </div>
                  </div>

                  {/* USD Amount (calculated) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      USD Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={usdAmount}
                        readOnly
                        className="w-full bg-slate-600/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">
                        USD
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-red-400 text-sm font-medium">
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
                (swapType === "buy" && sponsorValid !== true)
              }
              className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                swapType === "buy"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25"
                  : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-red-500/25"
              } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
            >
              {loading
                ? "Loading..."
                : `${swapType === "buy" ? "Buy" : "Sell"} BNB`}
            </button>

            {/* Price Info */}
            {bnbPrice && (
              <div className="mt-4 text-center text-sm text-gray-400">
                1 BNB = ${bnbPrice.toFixed(2)} USD
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              📈 Trading Info
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Real-time BNB prices from Binance</div>
              <div>• Instant price calculations</div>
              <div>• Live market data updates</div>
              <div>• Secure trading interface</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              💰 Buying Rules
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Each package: $100</div>
              <div>• Minimum: 1 package</div>
              <div>• Maximum: 10 packages</div>
              <div>• Max 10 buys per day</div>
              <div>• Daily buys: {dailyBuyCount}/10</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-green-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              ⚠️ Important Notice
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• This is a demo interface</div>
              <div>• No real transactions are executed</div>
              <div>• Connect your wallet for real trading</div>
              <div>• Always verify amounts before trading</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
