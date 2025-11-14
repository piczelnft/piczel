"use client";

import { useState, useEffect, useRef } from "react";

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
  const initializeWebSocket = () => {
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
  };

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
  }, []);

  // Duplicate the data to create seamless loop
  const duplicatedData = [...cryptoData, ...cryptoData];

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 border-b shadow-lg overflow-hidden animate-fadeInUp"
      style={{
        borderColor: '#1565c0',
        backgroundColor: '#1565c0',
        color: '#fff',
      }}
    >
      <div className="h-12 flex items-center relative">
        {loading ? (
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#fff' }}
              ></div>
              <span className="text-sm font-medium" style={{ color: '#fff' }}>
                {connectionStatus}
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundColor: '#fff' }}
              >
                <span className="text-blue-900 text-xs">!</span>
              </div>
              <span className="text-sm font-medium" style={{ color: '#fff' }}>
                {error}
              </span>
            </div>
          </div>
        ) : cryptoData.length === 0 ? (
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#fff' }}
              ></div>
              <span className="text-sm font-medium" style={{ color: '#fff' }}>
                Waiting for data...
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center space-x-8 animate-scroll whitespace-nowrap relative z-10"
            style={{ width: '200%' }}
          >
            {duplicatedData.map((crypto, index) => (
              <div
                key={`${crypto.symbol}-${index}`}
                className="flex items-center space-x-3 flex-shrink-0 group hover-lift-enhanced"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-cardFloat"
                  style={{ backgroundColor: '#0d47a1' }}
                >
                  <span className="text-white font-bold text-xs">
                    {crypto.symbol.charAt(0)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm">
                    {crypto.symbol}
                  </span>
                  <span className="text-xs text-white">
                    {crypto.name}
                  </span>
                </div>
                <div className="font-bold text-sm text-white">
                  {crypto.price}
                  <span className="ml-1 text-xs text-white">
                    {crypto.isPositive ? '↗' : '↘'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: '#1565c0', color: '#fff', border: '1px solid #fff' }}
                  >
                    <span className="text-xs">{crypto.isPositive ? '↗' : '↘'}</span>
                    <span>{crypto.change}</span>
                  </div>
                  {crypto.hasRealTimeChange && Math.abs(crypto.realTimeChangePercent) > 0.01 && (
                    <div
                      className="flex items-center space-x-1 px-1 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: '#1565c0', color: '#fff', border: '1px solid #fff' }}
                    >
                      <span className="text-xs">{crypto.isRealTimePositive ? '↗' : '↘'}</span>
                      <span>
                        {crypto.isRealTimePositive ? '+' : ''}
                        {crypto.realTimeChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-px h-4" style={{ backgroundColor: '#fff' }}></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
