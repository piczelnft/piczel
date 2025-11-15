import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DailyCommission from "@/models/DailyCommission";

export async function GET(request) {
  try {
    await dbConnect();

    // Get all inactive users
    const inactiveUsers = await User.find({ isActivated: false })
      .select("memberId name isActivated")
      .lean();

    console.log(`Found ${inactiveUsers.length} inactive users`);

    const results = [];

    for (const user of inactiveUsers) {
      // Find active commissions for this inactive user (as sponsor)
      const activeCommissions = await DailyCommission.find({
        sponsorId: user._id,
        status: 'active',
        daysRemaining: { $gt: 0 }
      }).select('level dailyAmount totalCommission daysRemaining nextPaymentDate status');

      if (activeCommissions.length > 0) {
        results.push({
          memberId: user.memberId,
          name: user.name,
          isActivated: user.isActivated,
          activeCommissions: activeCommissions.map(c => ({
            level: c.level,
            dailyAmount: c.dailyAmount,
            totalCommission: c.totalCommission,
            daysRemaining: c.daysRemaining,
            nextPaymentDate: c.nextPaymentDate,
            status: c.status
          }))
        });
      }
    }

    return NextResponse.json({
      success: true,
      inactiveUsersWithCommissions: results,
      totalInactiveUsers: inactiveUsers.length,
      usersWithActiveCommissions: results.length
    });

  } catch (error) {
    console.error("Error checking commissions:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
