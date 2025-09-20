'use client';

import { useState, useEffect, useRef } from 'react';

// Crypto symbols to track with their Binance symbols
const CRYPTO_SYMBOLS = [
  { symbol: 'BTC', name: 'Bitcoin', binanceSymbol: 'btcusdt' },
  { symbol: 'ETH', name: 'Ethereum', binanceSymbol: 'ethusdt' },
  { symbol: 'BNB', name: 'Binance Coin', binanceSymbol: 'bnbusdt' },
  { symbol: 'ADA', name: 'Cardano', binanceSymbol: 'adausdt' },
  { symbol: 'SOL', name: 'Solana', binanceSymbol: 'solusdt' },
  { symbol: 'DOT', name: 'Polkadot', binanceSymbol: 'dotusdt' },
  { symbol: 'MATIC', name: 'Polygon', binanceSymbol: 'maticusdt' },
  { symbol: 'AVAX', name: 'Avalanche', binanceSymbol: 'avaxusdt' },
  { symbol: 'LINK', name: 'Chainlink', binanceSymbol: 'linkusdt' },
  { symbol: 'UNI', name: 'Uniswap', binanceSymbol: 'uniusdt' },
  { symbol: 'LTC', name: 'Litecoin', binanceSymbol: 'ltcusdt' },
  { symbol: 'XRP', name: 'Ripple', binanceSymbol: 'xrpusdt' },
  { symbol: 'DOGE', name: 'Dogecoin', binanceSymbol: 'dogeusdt' },
  { symbol: 'SHIB', name: 'Shiba Inu', binanceSymbol: 'shibusdt' },
  { symbol: 'ATOM', name: 'Cosmos', binanceSymbol: 'atomusdt' }
];

export default function CryptoPriceTicker() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [previousPrices, setPreviousPrices] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  const initializeWebSocket = () => {
    try {
      // Create WebSocket connection to Binance stream
      const streams = CRYPTO_SYMBOLS.map(crypto => `${crypto.binanceSymbol}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setConnectionStatus('Connected');
        setError(null);
        setLoading(false);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.stream && data.data) {
            const streamData = data.data;
            const binanceSymbol = data.stream.replace('@ticker', '');
            const cryptoInfo = CRYPTO_SYMBOLS.find(c => c.binanceSymbol === binanceSymbol);
            
            if (cryptoInfo) {
              const currentPrice = parseFloat(streamData.c); // Current price
              const priceChange = parseFloat(streamData.P); // 24h price change percentage
              const previousPrice = previousPrices[cryptoInfo.symbol];
              const realTimeChange = previousPrice ? currentPrice - previousPrice : 0;
              const realTimeChangePercent = previousPrice ? (realTimeChange / previousPrice) * 100 : 0;
              
              setCryptoData(prevData => {
                const existingIndex = prevData.findIndex(item => item.symbol === cryptoInfo.symbol);
                const newItem = {
                  symbol: cryptoInfo.symbol,
                  name: cryptoInfo.name,
                  price: `$${currentPrice.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: currentPrice < 1 ? 6 : 2 
                  })}`,
                  change: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
                  isPositive: priceChange >= 0,
                  realTimeChange: realTimeChange,
                  realTimeChangePercent: realTimeChangePercent,
                  isRealTimePositive: realTimeChange >= 0,
                  hasRealTimeChange: previousPrice !== undefined
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
              setPreviousPrices(prev => ({
                ...prev,
                [cryptoInfo.symbol]: currentPrice
              }));
            }
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setConnectionStatus('Error');
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('Disconnected');
        
        // Reconnect after 5 seconds if not a normal closure
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            initializeWebSocket();
          }, 5000);
        }
      };
      
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setError('Failed to initialize WebSocket connection');
      setConnectionStatus('Error');
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
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-slate-800/95 via-purple-800/95 to-slate-800/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg ticker-glow overflow-hidden">
      <div className="h-12 flex items-center">
        {loading ? (
          /* Loading State */
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-cyan-400 text-sm font-medium">{connectionStatus}</span>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="text-red-400 text-sm font-medium">{error}</span>
            </div>
          </div>
        ) : cryptoData.length === 0 ? (
          /* No Data State */
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-yellow-400 text-sm font-medium">Waiting for data...</span>
            </div>
          </div>
        ) : (
          /* Scrolling Ticker Container */
          <div className="flex items-center space-x-8 animate-scroll whitespace-nowrap">
            {duplicatedData.map((crypto, index) => (
              <div key={`${crypto.symbol}-${index}`} className="flex items-center space-x-3 flex-shrink-0">
                {/* Crypto Icon */}
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs">{crypto.symbol.charAt(0)}</span>
                </div>
                
                {/* Crypto Info */}
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm">{crypto.symbol}</span>
                  <span className="text-gray-300 text-xs">{crypto.name}</span>
                </div>
                
                {/* Price */}
                <div className={`font-bold text-sm transition-all duration-500 ${
                  crypto.isPositive 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {crypto.price}
                  <span className={`ml-1 text-xs ${
                    crypto.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {crypto.isPositive ? '↗' : '↘'}
                  </span>
                </div>
                
                {/* Price Change */}
                <div className="flex items-center space-x-2">
                  {/* 24h Change */}
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    crypto.isPositive 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    <span className={`${crypto.isPositive ? 'price-up' : 'price-down'} text-xs`}>
                      {crypto.isPositive ? '↗' : '↘'}
                    </span>
                    <span className={crypto.isPositive ? 'price-up' : 'price-down'}>
                      {crypto.change}
                    </span>
                  </div>
                  
                  {/* Real-time Change */}
                  {crypto.hasRealTimeChange && Math.abs(crypto.realTimeChangePercent) > 0.01 && (
                    <div className={`flex items-center space-x-1 px-1 py-0.5 rounded text-xs font-medium ${
                      crypto.isRealTimePositive 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      <span className="text-xs">
                        {crypto.isRealTimePositive ? '↗' : '↘'}
                      </span>
                      <span>
                        {crypto.isRealTimePositive ? '+' : ''}{crypto.realTimeChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Separator */}
                <div className="w-px h-4 bg-gray-500/30"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
      </div>
    </div>
  );
}
