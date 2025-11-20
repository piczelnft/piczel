import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/**
 * One-time migration endpoint to update existing deactivation schedules
 * from 10-minute timer to 48-hour timer
 * 
 * Access: http://localhost:3000/api/users/reschedule-deactivations
 */
export async function GET(request) {
  try {
    await dbConnect();

    const now = new Date();
    console.log(`Current time: ${now.toISOString()}`);

    // Find all users with scheduled deactivations
    const usersWithSchedule = await User.find({
      isActivated: true,
      deactivationScheduledAt: { $ne: null }
    }).select('memberId name email deactivationScheduledAt holdingWalletBalance');

    console.log(`Found ${usersWithSchedule.length} users with scheduled deactivations`);

    if (usersWithSchedule.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with scheduled deactivations found',
        updatedCount: 0
      });
    }

    let updatedCount = 0;
    const updates = [];

    for (const user of usersWithSchedule) {
      const oldSchedule = new Date(user.deactivationScheduledAt);
      
      // Only update if holding balance is still 0 or less
      if (user.holdingWalletBalance <= 0) {
        const newSchedule = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

        await User.findByIdAndUpdate(user._id, {
          $set: {
            deactivationScheduledAt: newSchedule
          }
        });

        updatedCount++;
        updates.push({
          memberId: user.memberId,
          name: user.name,
          oldSchedule: oldSchedule.toISOString(),
          newSchedule: newSchedule.toISOString()
        });

        console.log(`Updated ${user.memberId}: ${oldSchedule.toISOString()} -> ${newSchedule.toISOString()}`);
      } else {
        // Clear schedule if balance is positive
        await User.findByIdAndUpdate(user._id, {
          $set: {
            deactivationScheduledAt: null
          }
        });
        
        console.log(`Cleared schedule for ${user.memberId} (positive balance: $${user.holdingWalletBalance})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} deactivation schedules to 48 hours`,
      updatedCount,
      updates
    });

  } catch (error) {
    console.error('Error rescheduling deactivations:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
