"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

const WalletContext = createContext({});

// USDT Contract Address on different networks
const USDT_CONTRACTS = {
  // Binance Smart Chain Mainnet
  "0x38": "0x55d398326f99059fF775485246999027B3197955",
  // Binance Smart Chain Testnet
  "0x61": "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
  // Ethereum Mainnet
  "0x1": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  // Polygon Mainnet
  "0x89": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
};

// ERC20 ABI for USDT transfers
const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Payment recipient address
const PAYMENT_RECIPIENT = "0xf5993810E11c280D9B4382392E4E46D032782042";

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account and network changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(newChainId);
      window.location.reload(); // Recommended by MetaMask/TokenPocket
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const network = await web3Provider.getNetwork();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setWalletAddress(accounts[0]);
        setChainId("0x" + network.chainId.toString(16));
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask or TokenPocket to continue.");
      return { success: false, error: "Wallet not installed" };
    }

    setIsLoading(true);
    setError(null);

    try {
      // First check if already connected
      let accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      // If not connected, request connection
      if (accounts.length === 0) {
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      }

      if (accounts.length > 0) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const network = await web3Provider.getNetwork();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setWalletAddress(accounts[0]);
        setChainId("0x" + network.chainId.toString(16));
        setIsConnected(true);

        // Save wallet address to localStorage
        localStorage.setItem("walletAddress", accounts[0]);

        // Save wallet address to backend if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const response = await fetch("/api/wallet/connect", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                walletAddress: accounts[0],
                network: network.name || "Unknown",
              }),
            });

            if (response.ok) {
              console.log("Wallet address saved to backend");
            } else {
              console.error("Failed to save wallet address to backend");
            }
          } catch (err) {
            console.error("Error saving wallet to backend:", err);
          }
        }

        console.log("Wallet connected successfully:", accounts[0]);
        return { success: true, address: accounts[0] };
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      
      // Handle specific MetaMask errors
      let errorMessage = "Failed to connect wallet";
      
      if (err.code === 4001) {
        errorMessage = "You rejected the connection request. Please try again.";
      } else if (err.code === -32002) {
        errorMessage = "Connection request is already pending. Please check your wallet.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }

    return { success: false, error: "No accounts found" };
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    localStorage.removeItem("walletAddress");
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return { success: false, error: "Wallet not found" };

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
      return { success: true };
    } catch (err) {
      console.error("Error switching network:", err);
      return { success: false, error: err.message };
    }
  };

  const getUSDTBalance = async () => {
    if (!isConnected || !provider) {
      return { success: false, balance: "0", error: "Wallet not connected" };
    }

    try {
      const usdtAddress = USDT_CONTRACTS[chainId];
      
      if (!usdtAddress) {
        return { success: false, balance: "0", error: "USDT not supported on this network" };
      }

      const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, provider);
      const decimals = await usdtContract.decimals();
      const balance = await usdtContract.balanceOf(walletAddress);
      const formattedBalance = ethers.formatUnits(balance, decimals);

      return {
        success: true,
        balance: formattedBalance,
        raw: balance,
      };
    } catch (err) {
      console.error("Error getting USDT balance:", err);
      return { success: false, balance: "0", error: err.message };
    }
  };

  const sendUSDT = async (amount = "100", recipientAddress = null, skipBalanceCheck = false) => {
    if (!isConnected || !signer) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use provided recipient or default to PAYMENT_RECIPIENT
      const recipient = recipientAddress || PAYMENT_RECIPIENT;
      
      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        throw new Error(`Invalid recipient address: ${recipient}`);
      }

      // Get USDT contract address for current network
      const usdtAddress = USDT_CONTRACTS[chainId];
      
      if (!usdtAddress) {
        throw new Error(`USDT not supported on this network. Please switch to BSC, Ethereum, or Polygon.`);
      }

      // Create contract instance
      const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, signer);

      // Get USDT decimals (usually 6 for USDT on most chains, 18 on some)
      const decimals = await usdtContract.decimals();

      // Convert amount to proper decimals
      const amountInWei = ethers.parseUnits(amount, decimals);

      // Check balance (can be skipped for testing)
      if (!skipBalanceCheck) {
        const balance = await usdtContract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatUnits(balance, decimals);
        
        if (balance < amountInWei) {
          throw new Error(`Insufficient USDT balance. You have ${formattedBalance} USDT, but need ${amount} USDT. Please add USDT to your wallet.`);
        }
      }

      // Send transaction
      const tx = await usdtContract.transfer(recipient, amountInWei);
      
      console.log("Transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log("Transaction confirmed:", receipt.hash);

      return {
        success: true,
        txHash: receipt.hash,
        amount: amount,
      };
    } catch (err) {
      console.error("Error sending USDT:", err);
      const errorMessage = err.message || "Transaction failed";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkName = (chainId) => {
    const networks = {
      "0x1": "Ethereum Mainnet",
      "0x38": "BSC Mainnet",
      "0x61": "BSC Testnet",
      "0x89": "Polygon Mainnet",
      "0x13881": "Polygon Mumbai Testnet",
    };
    return networks[chainId] || "Unknown Network";
  };

  const value = {
    walletAddress,
    isConnected,
    isLoading,
    error,
    chainId,
    networkName: chainId ? getNetworkName(chainId) : null,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendUSDT,
    getUSDTBalance,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
