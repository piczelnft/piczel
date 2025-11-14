"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b shadow-2xl" style={{backgroundColor: '#1565c0', borderColor: '#1565c0'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="Piczel Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-2xl font-bold text-white">
                  PICZEL
                </span>
              </Link>
            </div>
            <div className="animate-pulse bg-white h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b shadow-2xl animate-fadeInUp" style={{borderColor: '#1565c0', backgroundColor: '#1565c0'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Hamburger Menu & Logo */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-800"
                style={{
                  backgroundColor: '#1565c0',
                  border: '1px solid #1565c0'
                }}
                aria-label="Toggle sidebar"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-white transition-all duration-200"></div>
                  <div className="w-full h-0.5 bg-white transition-all duration-200"></div>
                  <div className="w-full h-0.5 bg-white transition-all duration-200"></div>
                </div>
              </button>
              
              {/* Logo */}
              <div className="flex items-center space-x-2 group">
                <Link href="/" className="flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/logo.png"
                    alt="Piczel Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain animate-cardFloat"
                  />
                  <div className="text-2xl font-bold text-white">
                    PICZEL
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
