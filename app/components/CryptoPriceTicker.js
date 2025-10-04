"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Crypto symbols to track with their Binance symbols
const CRYPTO_SYMBOLS = [
  { symbol: "BTC", name: "Bitcoin", binanceSymbol: "btcusdt" },
  { symbol: "ETH", name: "Ethereum", binanceSymbol: "ethusdt" },
  { symbol: "BNB", name: "Binance Coin", binanceSymbol: "bnbusdt" },
  { symbol: "ADA", name: "Cardano", binanceSymbol: "adausdt" },
  { symbol: "SOL", name: "Solana", binanceSymbol: "solusdt" },
  { symbol: "DOT", name: "Polkadot", binanceSymbol: "dotusdt" },
  { symbol: "MATIC", name: "Polygon", binanceSymbol: "maticusdt" },
  { symbol: "AVAX", name: "Avalanche", binanceSymbol: "avaxusdt" },
  { symbol: "LINK", name: "Chainlink", binanceSymbol: "linkusdt" },
  { symbol: "UNI", name: "Uniswap", binanceSymbol: "uniusdt" },
  { symbol: "LTC", name: "Litecoin", binanceSymbol: "ltcusdt" },
  { symbol: "XRP", name: "Ripple", binanceSymbol: "xrpusdt" },
  { symbol: "DOGE", name: "Dogecoin", binanceSymbol: "dogeusdt" },
  { symbol: "SHIB", name: "Shiba Inu", binanceSymbol: "shibusdt" },
  { symbol: "ATOM", name: "Cosmos", binanceSymbol: "atomusdt" },
];

export default function CryptoPriceTicker() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [previousPrices, setPreviousPrices] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    try {
      // Create WebSocket connection to Binance stream
      const streams = CRYPTO_SYMBOLS.map(
        (crypto) => `${crypto.binanceSymbol}@ticker`
      ).join("/");
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

      console.log("Connecting to WebSocket:", wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected successfully");
        setConnectionStatus("Connected");
        setError(null);
        setLoading(false);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.stream && data.data) {
            const streamData = data.data;
            const binanceSymbol = data.stream.replace("@ticker", "");
            const cryptoInfo = CRYPTO_SYMBOLS.find(
              (c) => c.binanceSymbol === binanceSymbol
            );

            if (cryptoInfo) {
              const currentPrice = parseFloat(streamData.c); // Current price
              const priceChange = parseFloat(streamData.P); // 24h price change percentage
              const previousPrice = previousPrices[cryptoInfo.symbol];
              const realTimeChange = previousPrice
                ? currentPrice - previousPrice
                : 0;
              const realTimeChangePercent = previousPrice
                ? (realTimeChange / previousPrice) * 100
                : 0;

              setCryptoData((prevData) => {
                const existingIndex = prevData.findIndex(
                  (item) => item.symbol === cryptoInfo.symbol
                );
                const newItem = {
                  symbol: cryptoInfo.symbol,
                  name: cryptoInfo.name,
                  price: `$${currentPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: currentPrice < 1 ? 6 : 2,
                  })}`,
                  change: `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(
                    2
                  )}%`,
                  isPositive: priceChange >= 0,
                  realTimeChange: realTimeChange,
                  realTimeChangePercent: realTimeChangePercent,
                  isRealTimePositive: realTimeChange >= 0,
                  hasRealTimeChange: previousPrice !== undefined,
                };

                if (existingIndex >= 0) {
                  const newData = [...prevData];
                  newData[existingIndex] = newItem;
                  return newData;
                } else {
                  return [...prevData, newItem];
                }
              });

              // Update previous price for next comparison
              setPreviousPrices((prev) => ({
                ...prev,
                [cryptoInfo.symbol]: currentPrice,
              }));
            }
          }
        } catch (parseError) {
          console.error("Error parsing WebSocket message:", parseError);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
        setConnectionStatus("Error");
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("Disconnected");

        // Reconnect after 5 seconds if not a normal closure
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...");
            initializeWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
      setError("Failed to initialize WebSocket connection");
      setConnectionStatus("Error");
    }
  }, [previousPrices]);

  // Initialize WebSocket connection on component mount
  useEffect(() => {
    initializeWebSocket();

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeWebSocket]);

  // Duplicate the data to create seamless loop
  const duplicatedData = [...cryptoData, ...cryptoData];

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 border-b shadow-lg ticker-glow overflow-hidden animate-fadeInUp"
      style={{
        borderColor: "var(--default-border)",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="h-12 flex items-center relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(0, 255, 190, 0.05), transparent)",
            }}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--primary-color), transparent)",
            }}
          ></div>
          {/* Floating particles */}
          <div className="particle" style={{ top: "20%", left: "10%" }}></div>
          <div className="particle" style={{ top: "60%", left: "30%" }}></div>
          <div className="particle" style={{ top: "40%", left: "70%" }}></div>
          <div className="particle" style={{ top: "80%", left: "90%" }}></div>
        </div>
        {loading ? (
          /* Loading State */
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--primary-color)" }}
              ></div>
              <span
                className="text-sm font-medium animate-neonGlow"
                style={{ color: "var(--primary-color)" }}
              >
                {connectionStatus}
              </span>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundColor: "rgb(var(--danger-rgb))" }}
              >
                <span className="text-white text-xs">!</span>
              </div>
              <span
                className="text-sm font-medium animate-neonGlow"
                style={{ color: "rgb(var(--danger-rgb))" }}
              >
                {error}
              </span>
            </div>
          </div>
        ) : cryptoData.length === 0 ? (
          /* No Data State */
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "rgb(var(--warning-rgb))" }}
              ></div>
              <span
                className="text-sm font-medium animate-neonGlow"
                style={{ color: "rgb(var(--warning-rgb))" }}
              >
                Waiting for data...
              </span>
            </div>
          </div>
        ) : (
          /* Scrolling Ticker Container */
          <div
            className="flex items-center space-x-8 animate-scroll whitespace-nowrap relative z-10"
            style={{ width: "200%" }}
          >
            {duplicatedData.map((crypto, index) => (
              <div
                key={`${crypto.symbol}-${index}`}
                className="flex items-center space-x-3 flex-shrink-0 group hover-lift-enhanced"
              >
                {/* Crypto Icon */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-cardFloat"
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(var(--warning-rgb)), rgb(var(--orange-rgb)))",
                  }}
                >
                  <span className="text-white font-bold text-xs">
                    {crypto.symbol.charAt(0)}
                  </span>
                </div>

                {/* Crypto Info */}
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm gradient-text-neon">
                    {crypto.symbol}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    {crypto.name}
                  </span>
                </div>

                {/* Price */}
                <div
                  className={`font-bold text-sm transition-all duration-500 animate-neonGlow ${
                    crypto.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                  style={{
                    color: crypto.isPositive
                      ? "rgb(var(--success-rgb))"
                      : "rgb(var(--danger-rgb))",
                  }}
                >
                  {crypto.price}
                  <span
                    className={`ml-1 text-xs`}
                    style={{
                      color: crypto.isPositive
                        ? "rgb(var(--success-rgb))"
                        : "rgb(var(--danger-rgb))",
                    }}
                  >
                    {crypto.isPositive ? "↗" : "↘"}
                  </span>
                </div>

                {/* Price Change */}
                <div className="flex items-center space-x-2">
                  {/* 24h Change */}
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      crypto.isPositive
                        ? "hover:bg-opacity-30"
                        : "hover:bg-opacity-30"
                    }`}
                    style={{
                      backgroundColor: crypto.isPositive
                        ? "rgba(72, 247, 104, 0.2)"
                        : "rgba(255, 74, 74, 0.2)",
                      color: crypto.isPositive
                        ? "rgb(var(--success-rgb))"
                        : "rgb(var(--danger-rgb))",
                      border: `1px solid ${
                        crypto.isPositive
                          ? "rgba(72, 247, 104, 0.3)"
                          : "rgba(255, 74, 74, 0.3)"
                      }`,
                    }}
                  >
                    <span className={`text-xs`}>
                      {crypto.isPositive ? "↗" : "↘"}
                    </span>
                    <span>{crypto.change}</span>
                  </div>

                  {/* Real-time Change */}
                  {crypto.hasRealTimeChange &&
                    Math.abs(crypto.realTimeChangePercent) > 0.01 && (
                      <div
                        className={`flex items-center space-x-1 px-1 py-0.5 rounded text-xs font-medium transition-all duration-300 ${
                          crypto.isRealTimePositive
                            ? "hover:bg-opacity-30"
                            : "hover:bg-opacity-30"
                        }`}
                        style={{
                          backgroundColor: crypto.isRealTimePositive
                            ? "rgba(0, 255, 190, 0.2)"
                            : "rgba(255, 74, 74, 0.2)",
                          color: crypto.isRealTimePositive
                            ? "var(--primary-color)"
                            : "rgb(var(--danger-rgb))",
                          border: `1px solid ${
                            crypto.isRealTimePositive
                              ? "rgba(0, 255, 190, 0.3)"
                              : "rgba(255, 74, 74, 0.3)"
                          }`,
                        }}
                      >
                        <span className="text-xs">
                          {crypto.isRealTimePositive ? "↗" : "↘"}
                        </span>
                        <span>
                          {crypto.isRealTimePositive ? "+" : ""}
                          {crypto.realTimeChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                </div>

                {/* Separator */}
                <div
                  className="w-px h-4"
                  style={{ backgroundColor: "var(--default-border)" }}
                ></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
