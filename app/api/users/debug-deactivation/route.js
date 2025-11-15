import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import Withdrawal from "@/models/Withdrawal";

/**
 * Debug endpoint to see user deactivation status
 */
export async function GET(request) {
  try {
    await dbConnect();

    const now = new Date();

    // Get all active users with their deactivation info
    const activeUsers = await User.find({ isActivated: true })
      .select("memberId name email holdingWalletBalance deactivationScheduledAt")
      .lean();

    const userDetails = [];

    for (const user of activeUsers) {
      // Calculate actual balance
      const nftPurchases = await NftPurchase.find({ userId: user._id });
      const totalNftAmount = nftPurchases.reduce((sum, p) => sum + (p.price || 100), 0);

      const paidOutNfts = await NftPurchase.find({ userId: user._id, payoutStatus: 'paid' });
      const totalPaidOut = paidOutNfts.reduce((sum, nft) => sum + (nft.paidOutAmount || 0), 0);

      const withdrawals = await Withdrawal.find({ 
        userId: user._id, 
        status: { $in: ['pending', 'approved', 'completed'] }
      });
      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

      const actualBalance = totalNftAmount - totalPaidOut - totalWithdrawn;

      const scheduledAt = user.deactivationScheduledAt ? new Date(user.deactivationScheduledAt) : null;
      const timeUntilDeactivation = scheduledAt ? Math.round((scheduledAt - now) / 1000 / 60) : null;

      userDetails.push({
        memberId: user.memberId,
        name: user.name,
        email: user.email,
        storedBalance: user.holdingWalletBalance || 0,
        actualBalance: actualBalance,
        nftCount: nftPurchases.length,
        paidOutCount: paidOutNfts.length,
        totalPaidOut: totalPaidOut,
        totalWithdrawn: totalWithdrawn,
        deactivationScheduledAt: scheduledAt?.toISOString() || null,
        minutesUntilDeactivation: timeUntilDeactivation,
        shouldBeDeactivated: actualBalance <= 0 && scheduledAt && scheduledAt <= now,
        shouldBeScheduled: actualBalance <= 0 && !scheduledAt
      });
    }

    return NextResponse.json({
      success: true,
      currentTime: now.toISOString(),
      totalActiveUsers: activeUsers.length,
      users: userDetails
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details", details: error.message },
      { status: 500 }
    );
  }
}
