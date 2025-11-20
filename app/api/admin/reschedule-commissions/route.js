import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyCommission from "@/models/DailyCommission";

/**
 * One-time migration endpoint to update existing commission schedules
 * from 5-minute intervals to 24-hour intervals
 * 
 * Access: http://localhost:3000/api/admin/reschedule-commissions
 */
export async function GET(request) {
  try {
    await dbConnect();

    const now = new Date();
    console.log(`Current time: ${now.toISOString()}`);

    // Find all active commissions
    const activeCommissions = await DailyCommission.find({
      status: 'active',
      daysRemaining: { $gt: 0 }
    }).select('sponsorMemberId memberId level nextPaymentDate totalDays daysPaid daysRemaining dailyAmount');

    console.log(`Found ${activeCommissions.length} active commissions`);

    if (activeCommissions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active commissions found',
        updatedCount: 0
      });
    }

    let updatedCount = 0;
    const updates = [];

    for (const commission of activeCommissions) {
      const oldNextPayment = new Date(commission.nextPaymentDate);
      
      // Reschedule to 24 hours from now instead of 5 minutes
      const newNextPayment = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await DailyCommission.findByIdAndUpdate(commission._id, {
        $set: {
          nextPaymentDate: newNextPayment
        }
      });

      updatedCount++;
      updates.push({
        commissionId: commission._id.toString(),
        sponsorMemberId: commission.sponsorMemberId,
        memberId: commission.memberId,
        level: commission.level,
        dailyAmount: commission.dailyAmount,
        daysPaid: commission.daysPaid,
        daysRemaining: commission.daysRemaining,
        oldNextPayment: oldNextPayment.toISOString(),
        newNextPayment: newNextPayment.toISOString()
      });

      console.log(`Updated commission ${commission._id}: ${oldNextPayment.toISOString()} -> ${newNextPayment.toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully rescheduled ${updatedCount} commissions to 24-hour intervals`,
      updatedCount,
      updates
    });

  } catch (error) {
    console.error('Error rescheduling commissions:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
