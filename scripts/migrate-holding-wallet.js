/**
 * Migration script to update holdingWalletBalance for existing users
 * This calculates the holding wallet balance based on existing NFT purchases
 * 
 * Run: node scripts/migrate-holding-wallet.js
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import NftPurchase from '../models/NftPurchase.js';
import Withdrawal from '../models/Withdrawal.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dgtek';

async function migrateHoldingWallet() {
  try {
    console.log('🔄 Starting holding wallet balance migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('memberId name email wallet.balance walletBalance holdingWalletBalance isActivated');
    console.log(`📊 Found ${users.length} total users\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.memberId} (${user.name})`);
      
      // Get total NFT purchases for this user
      const nftPurchases = await NftPurchase.find({ userId: user._id });
      const totalNftAmount = nftPurchases.reduce((sum, purchase) => sum + (purchase.price || 100), 0);
      
      console.log(`  📦 Total NFT purchases: ${nftPurchases.length}`);
      console.log(`  💰 Total NFT amount: $${totalNftAmount}`);

      // Get total NFT payouts for this user
      const paidOutNfts = await NftPurchase.find({ 
        userId: user._id, 
        payoutStatus: 'paid'
      });
      const totalPaidOut = paidOutNfts.reduce((sum, nft) => sum + (nft.paidOutAmount || 0), 0);
      
      console.log(`  💵 Total NFT payouts: ${paidOutNfts.length}`);
      console.log(`  💵 Total paid out amount: $${totalPaidOut}`);

      // Get total withdrawals for this user
      const withdrawals = await Withdrawal.find({ 
        userId: user._id, 
        status: { $in: ['pending', 'approved', 'completed'] }
      });
      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
      
      console.log(`  📤 Total withdrawals: ${withdrawals.length}`);
      console.log(`  💸 Total withdrawn amount: $${totalWithdrawn}`);

      // Calculate holding wallet balance
      // Holding wallet = Total NFT purchases - Total NFT payouts - Total withdrawals
      const calculatedHoldingBalance = totalNftAmount - totalPaidOut - totalWithdrawn;
      
      console.log(`  🧮 Calculated holding balance: $${calculatedHoldingBalance}`);
      console.log(`  📊 Current holding balance: $${user.holdingWalletBalance || 0}`);

      // Update the user's holding wallet balance
      if (user.holdingWalletBalance !== calculatedHoldingBalance) {
        await User.findByIdAndUpdate(user._id, {
          $set: {
            holdingWalletBalance: calculatedHoldingBalance
          }
        });
        
        console.log(`  ✅ Updated holding balance to $${calculatedHoldingBalance}`);
        updatedCount++;

        // If holding balance is 0 or less and user is active, schedule deactivation
        if (calculatedHoldingBalance <= 0 && user.isActivated) {
          const scheduleTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
          await User.findByIdAndUpdate(user._id, {
            $set: {
              deactivationScheduledAt: scheduleTime
            }
          });
          console.log(`  ⏰ Scheduled deactivation for ${scheduleTime.toISOString()}`);
        }
      } else {
        console.log(`  ⏭️  Holding balance already correct, skipping`);
        skippedCount++;
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Total users processed: ${users.length}`);
    console.log(`✅ Users updated: ${updatedCount}`);
    console.log(`⏭️  Users skipped: ${skippedCount}`);
    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateHoldingWallet();
