import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import Withdrawal from "@/models/Withdrawal";

/**
 * Calculate holding wallet balance for a user
 * Holding balance = Total NFT purchases - Total NFT payouts - Total withdrawals
 */
async function calculateHoldingBalance(userId) {
  // Get total NFT purchases
  const nftPurchases = await NftPurchase.find({ userId });
  const totalNftAmount = nftPurchases.reduce((sum, purchase) => sum + (purchase.price || 100), 0);

  // Get total NFT payouts
  const paidOutNfts = await NftPurchase.find({ userId, payoutStatus: 'paid' });
  const totalPaidOut = paidOutNfts.reduce((sum, nft) => sum + (nft.paidOutAmount || 0), 0);

  // Get total withdrawals
  const withdrawals = await Withdrawal.find({ 
    userId, 
    status: { $in: ['pending', 'approved', 'completed'] }
  });
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  return totalNftAmount - totalPaidOut - totalWithdrawn;
}

/**
 * Background job to check and deactivate users whose holding wallet balance has been 0 for more than 10 minutes
 * This endpoint should be called periodically (e.g., every minute via cron job)
 */
export async function POST(request) {
  try {
    await dbConnect();

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    console.log("🔍 Checking for users to deactivate...");
    console.log(`Current time: ${now.toISOString()}`);
    console.log(`10 minutes ago: ${tenMinutesAgo.toISOString()}`);

    // Get all active users
    const activeUsers = await User.find({ isActivated: true })
      .select("memberId name email holdingWalletBalance deactivationScheduledAt");

    console.log(`Found ${activeUsers.length} active users to check`);

    const usersNeedingSchedule = [];
    const usersToDeactivate = [];

    // Check each user's actual holding balance
    for (const user of activeUsers) {
      const actualBalance = await calculateHoldingBalance(user._id);
      
      console.log(`👤 ${user.memberId}: Balance $${actualBalance}, Scheduled: ${user.deactivationScheduledAt?.toISOString() || 'none'}`);

      // Update the stored balance if different
      if (user.holdingWalletBalance !== actualBalance) {
        await User.findByIdAndUpdate(user._id, {
          $set: { holdingWalletBalance: actualBalance }
        });
      }

      // STEP 1: If balance is 0 and no schedule, create one
      if (actualBalance <= 0 && !user.deactivationScheduledAt) {
        const scheduleTime = new Date(now.getTime() + 10 * 60 * 1000);
        console.log(`⏰ Scheduling deactivation for ${user.memberId} at ${scheduleTime.toISOString()}`);
        
        await User.findByIdAndUpdate(user._id, {
          $set: { deactivationScheduledAt: scheduleTime }
        });
        
        usersNeedingSchedule.push(user.memberId);
      }
      // STEP 2: If balance is 0 and schedule time has passed, deactivate
      else if (actualBalance <= 0 && user.deactivationScheduledAt && user.deactivationScheduledAt <= now) {
        console.log(`🔒 Deactivating user: ${user.memberId} (${user.name})`);
        
        await User.findByIdAndUpdate(user._id, {
          $set: {
            isActivated: false,
            deactivationScheduledAt: null
          }
        });
        
        usersToDeactivate.push({
          memberId: user.memberId,
          name: user.name,
          email: user.email,
          deactivatedAt: now.toISOString()
        });
      }
      // STEP 3: If balance is positive but schedule exists, clear it
      else if (actualBalance > 0 && user.deactivationScheduledAt) {
        console.log(`✅ Clearing deactivation schedule for ${user.memberId} (positive balance: $${actualBalance})`);
        
        await User.findByIdAndUpdate(user._id, {
          $set: { deactivationScheduledAt: null }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled ${usersNeedingSchedule.length} users, Deactivated ${usersToDeactivate.length} users`,
      scheduledUsers: usersNeedingSchedule.length,
      deactivatedUsers: usersToDeactivate,
      checkedAt: now.toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in deactivation check:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger to check deactivation status
 */
export async function GET(request) {
  try {
    await dbConnect();

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Find users scheduled for deactivation
    const scheduledUsers = await User.find({
      isActivated: true,
      holdingWalletBalance: 0,
      deactivationScheduledAt: { $ne: null }
    }).select("memberId name holdingWalletBalance deactivationScheduledAt");

    const usersToDeactivateNow = scheduledUsers.filter(user => 
      user.deactivationScheduledAt && user.deactivationScheduledAt <= tenMinutesAgo
    );

    return NextResponse.json({
      currentTime: now.toISOString(),
      tenMinutesAgo: tenMinutesAgo.toISOString(),
      totalScheduled: scheduledUsers.length,
      readyToDeactivate: usersToDeactivateNow.length,
      scheduledUsers: scheduledUsers.map(u => ({
        memberId: u.memberId,
        name: u.name,
        holdingBalance: u.holdingWalletBalance,
        scheduledAt: u.deactivationScheduledAt?.toISOString(),
        minutesUntilDeactivation: u.deactivationScheduledAt 
          ? Math.round((u.deactivationScheduledAt.getTime() + 10 * 60 * 1000 - now.getTime()) / 60000)
          : null
      }))
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error checking deactivation status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
