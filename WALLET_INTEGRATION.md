# Wallet Integration Setup

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

This will install the new `ethers` package (v6.13.0) that was added to package.json.

## Features Implemented

### 1. WalletContext
- Created `contexts/WalletContext.js` - A comprehensive wallet management system
- Supports MetaMask and TokenPocket wallets
- Handles USDT payments on multiple networks (BSC, Ethereum, Polygon)
- Auto-connects if wallet was previously connected
- Listens for account and network changes

### 2. Login Page Enhancement
- Added "Connect Wallet" button on login page
- Wallet connection is optional - users can login without connecting
- Shows connected wallet address in truncated format
- Uses the new WalletContext for wallet management

### 3. NFT Purchase Integration
- **NFT Buy Page (`/nft-buy`)**: Updated to require wallet connection and USDT payment
- **NFT Series Page (`/nft/[series]`)**: Updated to require wallet connection and USDT payment
- Payment flow:
  1. User clicks "Buy" button
  2. System checks if wallet is connected (prompts to connect if not)
  3. Confirms purchase with payment details
  4. Opens TokenPocket/MetaMask to send 100 USDT to recipient address
  5. Records transaction hash in backend
  6. Shows success message with transaction details

### 4. Payment Configuration
- **Recipient Address**: `0xf5993810E11c280D9B4382392E4E46D032782042`
- **Amount**: 100 USDT per NFT
- **Supported Networks**:
  - Binance Smart Chain (BSC) Mainnet - `0x38`
  - BSC Testnet - `0x61`
  - Ethereum Mainnet - `0x1`
  - Polygon Mainnet - `0x89`

## Usage

### For Users

1. **Connect Wallet (Login Page)**:
   - Click "Connect Wallet" button
   - Approve connection in TokenPocket/MetaMask
   - Wallet address will be displayed once connected

2. **Purchase NFT**:
   - Navigate to NFT Buy page or NFT Series page
   - Click "Buy" on an available NFT
   - If wallet not connected, system will prompt to connect
   - Confirm the purchase (shows amount and recipient)
   - Approve the USDT transaction in your wallet
   - Wait for confirmation
   - Transaction hash will be recorded and displayed

### For Developers

#### WalletContext API

```javascript
import { useWallet } from '@/contexts/WalletContext';

function MyComponent() {
  const {
    walletAddress,     // Connected wallet address
    isConnected,       // Boolean - is wallet connected
    isLoading,         // Boolean - is operation in progress
    error,             // Error message if any
    chainId,           // Current network chain ID
    networkName,       // Human-readable network name
    connectWallet,     // Function to connect wallet
    disconnectWallet,  // Function to disconnect wallet
    switchNetwork,     // Function to switch networks
    sendUSDT,          // Function to send USDT
  } = useWallet();

  // Connect wallet
  const handleConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      console.log('Connected:', result.address);
    }
  };

  // Send USDT
  const handlePay = async () => {
    const result = await sendUSDT("100");
    if (result.success) {
      console.log('Payment successful:', result.txHash);
    }
  };
}
```

#### USDT Contract Addresses

The system automatically uses the correct USDT contract based on the connected network:

- **BSC Mainnet**: `0x55d398326f99059fF775485246999027B3197955`
- **BSC Testnet**: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`
- **Ethereum Mainnet**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **Polygon Mainnet**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

## Testing

### Testnet Testing (Recommended for Development)

1. **Switch to BSC Testnet**:
   - In TokenPocket/MetaMask, switch to BSC Testnet
   - Get testnet BNB from faucet: https://testnet.bnbchain.org/faucet-smart
   - Get testnet USDT from faucet (if available)

2. **Test Purchase**:
   - Connect wallet on login page
   - Navigate to NFT buy page
   - Attempt to purchase an NFT
   - Approve transaction in wallet
   - Verify transaction on BSC Testnet explorer

### Mainnet Testing (Production)

1. Ensure you have sufficient USDT in your wallet (100 USDT per NFT)
2. Ensure you have sufficient gas tokens (BNB, ETH, or MATIC)
3. Connect wallet and make purchase
4. Transaction will be sent to: `0xf5993810E11c280D9B4382392E4E46D032782042`

## Important Notes

### Production Checklist

- ✅ Wallet integration is production-ready
- ✅ Supports major wallets (MetaMask, TokenPocket)
- ✅ Handles network switching
- ✅ Records transaction hashes
- ✅ Error handling implemented
- ✅ User confirmation dialogs
- ⚠️ **Test thoroughly on testnet before mainnet**

### Security Considerations

1. **Transaction Verification**: All transactions are recorded with hash on backend
2. **Network Validation**: System ensures USDT contract exists on current network
3. **Balance Check**: Verifies user has sufficient USDT before transaction
4. **User Confirmation**: Multiple confirmation dialogs prevent accidental purchases

### Common Issues

1. **"Wallet not installed"**: User needs to install MetaMask or TokenPocket browser extension
2. **"USDT not supported"**: User is on unsupported network - switch to BSC, Ethereum, or Polygon
3. **"Insufficient balance"**: User doesn't have enough USDT in wallet
4. **Transaction failed**: Check gas balance, network congestion, or try again

## Backend Updates Needed

The NFT purchase API already accepts additional fields. If you want to store wallet transaction data, ensure your `NftPurchase` model includes:

```javascript
{
  txHash: String,          // Transaction hash from blockchain
  paymentAmount: Number,   // Amount paid (100 USDT)
  walletAddress: String,   // User's wallet address
}
```

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Verify network and wallet connection
3. Ensure sufficient USDT and gas tokens
4. Test on testnet first before mainnet
