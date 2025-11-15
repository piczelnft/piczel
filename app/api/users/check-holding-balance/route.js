import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Debug endpoint to check user holding wallet balances
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Get all users with their holding wallet info
    const users = await User.find({})
      .select('memberId name email isActivated holdingWalletBalance walletBalance deactivationScheduledAt')
      .sort({ memberId: 1 });

    const userDetails = users.map(user => ({
      memberId: user.memberId,
      name: user.name,
      email: user.email,
      isActivated: user.isActivated,
      walletBalance: user.walletBalance || 0,
      holdingWalletBalance: user.holdingWalletBalance || 0,
      deactivationScheduledAt: user.deactivationScheduledAt,
      shouldBeDeactivated: user.holdingWalletBalance <= 0 && user.isActivated
    }));

    return NextResponse.json({
      totalUsers: users.length,
      currentTime: new Date().toISOString(),
      users: userDetails
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error checking holding wallets:", error);
    return NextResponse.json(
      { error: "Failed to check holding wallets", details: error.message },
      { status: 500 }
    );
  }
}
