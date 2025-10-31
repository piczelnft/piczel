import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DailyCommission from "@/models/DailyCommission";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

// GET - Process commissions automatically (for cron jobs)
export async function GET(request) {
  try {
    console.log("Automatic Commission Processing API called");

    // Connect to database
    await dbConnect();
    console.log("Database connected successfully");

    // Use current time so commissions created today are eligible immediately
    const now = new Date();

    // Find all active daily commissions that need payment now (only 5-minute demo commissions)
    const commissionsToProcess = await DailyCommission.find({
      status: 'active',
      nextPaymentDate: { $lte: now },
      daysRemaining: { $gt: 0 },
      totalDays: 365, // Only process 365 (30h 25m) total day commissions
      dailyAmount: { $gte: 0.001 } // Only process commissions with meaningful amounts
    });

    console.log(`Found ${commissionsToProcess.length} commissions to process`);

    const processedCommissions = [];
    const errors = [];

    for (const commission of commissionsToProcess) {
      try {
        // Validate sponsorId is a valid ObjectId
        if (!commission.sponsorId || !/^[0-9a-fA-F]{24}$/.test(commission.sponsorId)) {
          console.error(`Invalid sponsorId format for commission ${commission._id}: ${commission.sponsorId}`);
          errors.push(`Invalid sponsorId format for commission ${commission._id}: ${commission.sponsorId}`);
          continue;
        }

        // Get the sponsor user
        const sponsorUser = await User.findById(commission.sponsorId);
        if (!sponsorUser) {
          console.error(`Sponsor not found for commission ${commission._id}`);
          errors.push(`Sponsor not found for commission ${commission._id}`);
          continue;
        }

        // Calculate the payment amount
        const paymentAmount = commission.dailyAmount;
        const currentBalance = sponsorUser.wallet?.balance || sponsorUser.walletBalance || 0;
        const newBalance = currentBalance + paymentAmount;

        // All levels now use levelIncome (combined sponsorIncome + levelIncome)
        let incomeField = 'levelIncome';

        // Update sponsor's wallet and income
        await User.findOneAndUpdate(
          { _id: commission.sponsorId },
          {
            $set: {
              "wallet.balance": newBalance,
              "walletBalance": newBalance
            },
            $inc: {
              [incomeField]: paymentAmount
            }
          }
        );

        // Update the commission record
        const updatedCommission = await DailyCommission.findOneAndUpdate(
          { _id: commission._id },
          {
            $inc: {
              daysPaid: 1,
              daysRemaining: -1,
              totalPaid: paymentAmount,
              remainingAmount: -paymentAmount
            },
            $set: {
              lastPaymentDate: new Date(),
              nextPaymentDate: new Date(Date.now() + 5 * 60 * 1000), // Next 5 minutes for demo
              status: commission.daysRemaining === 1 ? 'completed' : 'active'
            }
          },
          { new: true }
        );

        processedCommissions.push({
          commissionId: commission._id,
          sponsorId: sponsorUser.memberId,
          sponsorName: sponsorUser.name,
          memberId: commission.memberId,
          paymentAmount: paymentAmount,
          totalPaid: updatedCommission.totalPaid,
          daysRemaining: updatedCommission.daysRemaining,
          status: updatedCommission.status
        });

        console.log(`Processed commission for ${sponsorUser.memberId}: $${paymentAmount}`);

      } catch (error) {
        console.error(`Error processing commission ${commission._id}:`, error);
        errors.push(`Error processing commission ${commission._id}: ${error.message}`);
      }
    }

    // Get summary statistics
    const totalProcessed = processedCommissions.length;
    const totalAmount = processedCommissions.reduce((sum, comm) => sum + comm.paymentAmount, 0);
    const completedCommissions = processedCommissions.filter(comm => comm.status === 'completed').length;

    console.log(`Automatic commission processing completed: ${totalProcessed} commissions processed, $${totalAmount.toFixed(2)} distributed`);
    console.log(`API Response Summary: Processed: ${totalProcessed}, Distributed: $${totalAmount.toFixed(2)}, Completed: ${completedCommissions}, Errors: ${errors.length}`);

    return NextResponse.json(
      {
        message: "Commissions processed automatically",
        summary: {
          totalProcessed,
          totalAmount: totalAmount.toFixed(2),
          completedCommissions,
          errors: errors.length
        },
        processedCommissions,
        errors
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );

  } catch (error) {
    console.error("Automatic Commission Processing API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
