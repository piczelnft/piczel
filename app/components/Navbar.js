"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";

// Wallet connection states
const WALLET_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [walletState, setWalletState] = useState(WALLET_STATES.DISCONNECTED);
  const [walletAddress, setWalletAddress] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0.0000');
  const { user, isAuthenticated, logout, isLoading, authVersion } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const userMenuRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log("Navbar - Auth state changed:", {
      isAuthenticated,
      user: user?.name,
      authVersion,
    });
  }, [isAuthenticated, user, authVersion]);

  // Fetch BNB balance when wallet connects
  useEffect(() => {
    if (walletState === WALLET_STATES.CONNECTED && walletAddress) {
      getTokenBalance(walletAddress).then(balance => {
        setTokenBalance(balance);
      });
    } else {
      setTokenBalance('0.0000');
    }
  }, [walletState, walletAddress]);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Wallet connection functions
  const connectWallet = async () => {
    try {
      setWalletState(WALLET_STATES.CONNECTING);
      
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          // Switch to BSC Testnet network if needed
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x61' }], // 97 in hex (BSC Testnet)
            });
          } catch (switchError) {
            // If the network doesn't exist, add it
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x61',
                      chainName: 'BNB Smart Chain Testnet',
                      nativeCurrency: {
                        name: 'BNB',
                        symbol: 'tBNB',
                        decimals: 18,
                      },
                      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                      blockExplorerUrls: ['https://testnet.bscscan.com'],
                    },
                  ],
                });
              } catch (addError) {
                console.error('Error adding BSC Testnet:', addError);
                // Fallback to localhost if BSC fails
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: '0x7A69',
                        chainName: 'Hardhat Local',
                        nativeCurrency: {
                          name: 'BNB',
                          symbol: 'BNB',
                          decimals: 18,
                        },
                        rpcUrls: ['http://127.0.0.1:8545'],
                        blockExplorerUrls: null,
                      },
                    ],
                  });
                } catch (localhostError) {
                  console.error('Error adding localhost network:', localhostError);
                }
              }
            }
          }
          
          setWalletAddress(accounts[0]);
          setWalletState(WALLET_STATES.CONNECTED);
          console.log('Wallet connected:', accounts[0]);
          console.log('Connected to DGTek BNB network');
        } else {
          setWalletState(WALLET_STATES.DISCONNECTED);
        }
      } else {
        // MetaMask not installed
        alert('Please install MetaMask to connect your wallet');
        setWalletState(WALLET_STATES.ERROR);
        setTimeout(() => setWalletState(WALLET_STATES.DISCONNECTED), 3000);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState(WALLET_STATES.ERROR);
      setTimeout(() => setWalletState(WALLET_STATES.DISCONNECTED), 3000);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletState(WALLET_STATES.DISCONNECTED);
    setTokenBalance('0.0000');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get BNB balance from wallet
  const getTokenBalance = async (address) => {
    try {
      // Get BNB balance directly
      const result = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      const balance = parseInt(result, 16) / Math.pow(10, 18);
      return balance.toFixed(4);
    } catch (error) {
      console.error('Error getting BNB balance:', error);
      return '0.0000';
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/30 shadow-2xl" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                PICZEL
              </div>
            </div>
            <div className="animate-pulse bg-slate-700 h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b shadow-2xl animate-fadeInUp" style={{borderColor: 'var(--default-border)', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Hamburger Menu & Logo */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-20"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
                aria-label="Toggle sidebar"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-white transition-all duration-200" style={{backgroundColor: 'var(--primary-color)'}}></div>
                  <div className="w-full h-0.5 bg-white transition-all duration-200" style={{backgroundColor: 'var(--primary-color)'}}></div>
                  <div className="w-full h-0.5 bg-white transition-all duration-200" style={{backgroundColor: 'var(--primary-color)'}}></div>
                </div>
              </button>
              
              {/* Logo */}
              <div className="flex items-center space-x-2 group">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-cardFloat" style={{background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'}}>
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--primary-color)'}}></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white gradient-text-enhanced animate-neonGlow">
                    PICZEL
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Authentication */}
            <div className="flex items-center space-x-4">
              {/* Connect Wallet Button - Always visible */}
                  {walletState === WALLET_STATES.CONNECTED ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 glass-card rounded-lg px-3 py-2 hover-lift-enhanced transition-all duration-300">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center animate-cardFloat" style={{background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'}}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="text-sm">
                          <div className="text-white font-medium gradient-text-neon">
                            {formatAddress(walletAddress)}
                          </div>
                          <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.7)'}}>
                            BNB: {tokenBalance}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={disconnectWallet}
                        className="px-3 py-2 text-xs font-medium text-white transition-all duration-300 hover-lift-enhanced rounded-lg"
                        style={{color: 'rgba(255, 255, 255, 0.6)', backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
                      >
                        Disconnect
                      </button>
                    </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={walletState === WALLET_STATES.CONNECTING}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover-lift-enhanced hover-glow rounded-lg"
                  style={{
                    backgroundColor: walletState === WALLET_STATES.CONNECTING 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(29, 68, 67, 0.8)',
                    border: '1px solid var(--default-border)',
                    opacity: walletState === WALLET_STATES.CONNECTING ? 0.7 : 1
                  }}
                >
                  {walletState === WALLET_STATES.CONNECTING ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              )}

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 glass-card rounded-lg px-4 py-2 hover-lift-enhanced hover-glow transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center ring-2 transition-all animate-cardFloat" style={{background: 'linear-gradient(135deg, rgb(var(--success-rgb)), var(--primary-color))', ringColor: 'rgba(0, 255, 190, 0.3)'}}>
                      <span className="text-white font-semibold text-sm animate-neonGlow">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="text-white hidden sm:block">
                      <div className="text-sm font-medium gradient-text-neon">
                        DGT123456
                      </div>
                      <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.7)'}}>
                        {user?.email || ""}
                      </div>
                      <div className="text-xs animate-neonGlow" style={{color: 'var(--primary-color)'}}>
                        Balance: ${user?.wallet?.balance?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform group-hover:text-white ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                      style={{color: 'rgba(255, 255, 255, 0.7)'}}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass-enhanced rounded-lg shadow-xl py-2 z-50 animate-fadeInUp" style={{border: '1px solid var(--default-border)'}}>
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b" style={{borderColor: 'var(--default-border)'}}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center animate-cardFloat" style={{background: 'linear-gradient(135deg, rgb(var(--success-rgb)), var(--primary-color))'}}>
                            <span className="text-white font-semibold animate-neonGlow">
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm gradient-text-neon">
                              {user?.name || "User"}
                            </div>
                            <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.7)'}}>
                              {user?.email || ""}
                            </div>
                            <div className="text-xs font-medium animate-neonGlow" style={{color: 'var(--primary-color)'}}>
                              Wallet: $
                              {user?.wallet?.balance?.toFixed(2) || "0.00"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm transition-all duration-300 group hover-lift-enhanced"
                          style={{color: 'rgba(255, 255, 255, 0.8)'}}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Profile
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex items-center px-4 py-2 text-sm transition-all duration-300 group hover-lift-enhanced"
                          style={{color: 'rgba(255, 255, 255, 0.8)'}}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          Wallet
                        </Link>
                        <Link
                          href="/profile/summary"
                          className="flex items-center px-4 py-2 text-sm transition-all duration-300 group hover-lift-enhanced"
                          style={{color: 'rgba(255, 255, 255, 0.8)'}}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </Link>
                      </div>

                      <hr className="my-2" style={{borderColor: 'var(--default-border)'}} />

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          // Disconnect wallet when signing out
                          disconnectWallet();
                          logout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm transition-all duration-300 group hover-lift-enhanced"
                        style={{color: 'rgb(var(--danger-rgb))'}}
                      >
                        <svg
                          className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover-lift-enhanced"
                    style={{color: 'rgba(255, 255, 255, 0.8)'}}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-enhanced px-4 py-2 text-sm font-medium text-white hover-bounce hover-glow transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
