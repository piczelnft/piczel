import { useState, useEffect } from 'react';

export const useMetaMask = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Connect to MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get network information
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        const network = getNetworkName(chainId);

        // Save to backend
        const saved = await saveWalletToBackend(accounts[0], network);
        if (saved) {
          console.log('Wallet connected and saved to backend');
        }

        return true;
      }
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError('Failed to connect to MetaMask. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      // Remove from backend
      await removeWalletFromBackend();
      
      setAccount('');
      setIsConnected(false);
      setError('');
      
      console.log('Wallet disconnected');
      return true;
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet.');
      return false;
    }
  };

  // Get network name from chain ID
  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Test Network',
      '0x4': 'Rinkeby Test Network',
      '0x5': 'Goerli Test Network',
      '0x2a': 'Kovan Test Network',
      '0x38': 'BSC Mainnet',
      '0x61': 'BSC Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
    };
    return networks[chainId] || 'Unknown Network';
  };

  // Save wallet to backend
  const saveWalletToBackend = async (address, network) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        return false;
      }

      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress: address,
          network: network,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        setError(data.error || 'Failed to save wallet to backend');
        return false;
      }
    } catch (err) {
      console.error('Error saving wallet to backend:', err);
      setError('Failed to save wallet to backend');
      return false;
    }
  };

  // Remove wallet from backend
  const removeWalletFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch('/api/wallet/connect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (err) {
      console.error('Error removing wallet from backend:', err);
      return false;
    }
  };

  // Load existing wallet connection
  const loadWalletStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/wallet/connect', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.wallet.isConnected) {
          setAccount(data.wallet.address);
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error('Error loading wallet status:', err);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      // Load existing connection
      loadWalletStatus();

      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount('');
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          setIsConnected(true);
          // Save new account to backend
          saveWalletToBackend(accounts[0], 'Ethereum');
        }
      };

      // Listen for chain changes
      const handleChainChanged = (chainId) => {
        const network = getNetworkName(chainId);
        if (account) {
          saveWalletToBackend(account, network);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  // Get shortened address
  const getShortAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    isConnected,
    account,
    error,
    loading,
    connect,
    disconnect,
    getShortAddress,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };
};
