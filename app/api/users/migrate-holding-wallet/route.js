import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import Withdrawal from "@/models/Withdrawal";

/**
 * Migration endpoint to update holdingWalletBalance for all users
 * This should be called once to fix existing data
 */
export async function POST(request) {
  try {
    await dbConnect();

    console.log('🔄 Starting holding wallet balance migration...');

    // Get all users
    const users = await User.find({}).select('memberId name email wallet.balance walletBalance holdingWalletBalance isActivated');
    console.log(`📊 Found ${users.length} total users`);

    let updatedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const user of users) {
      // Get total NFT purchases for this user
      const nftPurchases = await NftPurchase.find({ userId: user._id });
      const totalNftAmount = nftPurchases.reduce((sum, purchase) => sum + (purchase.price || 100), 0);

      // Get total withdrawals for this user
      const withdrawals = await Withdrawal.find({ 
        userId: user._id, 
        status: { $in: ['pending', 'approved', 'completed'] }
      });
      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

      // Calculate holding wallet balance
      const calculatedHoldingBalance = totalNftAmount - totalWithdrawn;

      const userResult = {
        memberId: user.memberId,
        name: user.name,
        nftPurchases: nftPurchases.length,
        totalNftAmount,
        totalWithdrawn,
        oldHoldingBalance: user.holdingWalletBalance || 0,
        newHoldingBalance: calculatedHoldingBalance,
        updated: false
      };

      // Update the user's holding wallet balance if different
      if (user.holdingWalletBalance !== calculatedHoldingBalance) {
        const updateResult = await User.findByIdAndUpdate(
          user._id, 
          {
            $set: {
              holdingWalletBalance: calculatedHoldingBalance
            }
          },
          { new: true }
        );
        
        console.log(`Updated ${user.memberId}: ${user.holdingWalletBalance || 0} -> ${calculatedHoldingBalance}`);
        
        if (!updateResult) {
          console.error(`Failed to update user ${user.memberId}`);
          userResult.error = 'Update failed';
        } else {
          userResult.updated = true;
          updatedCount++;

          // If holding balance is 0 or less and user is active, schedule deactivation
          if (calculatedHoldingBalance <= 0 && user.isActivated) {
            const scheduleTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
            await User.findByIdAndUpdate(user._id, {
              $set: {
                deactivationScheduledAt: scheduleTime
              }
            });
            userResult.scheduledDeactivation = scheduleTime.toISOString();
          }
        }
      } else {
        skippedCount++;
      }

      results.push(userResult);
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully`,
      totalUsers: users.length,
      updated: updatedCount,
      skipped: skippedCount,
      results
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint to migrate holding wallet balances for all users"
  });
}
