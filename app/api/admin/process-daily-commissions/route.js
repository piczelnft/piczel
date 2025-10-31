import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DailyCommission from "@/models/DailyCommission";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// POST - Process daily commissions
export async function POST(request) {
  try {
    console.log("Daily Commission Processing API called");

    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Verify this is an admin token
      if (!decoded.isAdmin || decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          {
            status: 403,
            headers: corsHeaders(),
          }
        );
      }

      console.log("Admin daily commission processing request verified");

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Use current time so commissions created today are eligible immediately
      const now = new Date();

      // Find all active daily commissions that need payment now
      const commissionsToProcess = await DailyCommission.find({
        status: 'active',
        nextPaymentDate: { $lte: now },
        daysRemaining: { $gt: 0 }
      });

      console.log(`Found ${commissionsToProcess.length} commissions to process`);

      const processedCommissions = [];
      const errors = [];

      for (const commission of commissionsToProcess) {
        try {
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
                nextPaymentDate: new Date(Date.now() + 60 * 1000), // Next minute for demo
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

      console.log(`Daily commission processing completed: ${totalProcessed} commissions processed, $${totalAmount.toFixed(2)} distributed`);

      return NextResponse.json(
        {
          message: "Daily commissions processed successfully",
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

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error) {
    console.error("Daily Commission Processing API error:", error);
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

// GET - Get daily commission statistics
export async function GET(request) {
  try {
    console.log("Daily Commission Statistics API called");

    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Verify this is an admin token
      if (!decoded.isAdmin || decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          {
            status: 403,
            headers: corsHeaders(),
          }
        );
      }

      // Connect to database
      await dbConnect();

      // Get commission statistics
      const totalCommissions = await DailyCommission.countDocuments();
      const activeCommissions = await DailyCommission.countDocuments({ status: 'active' });
      const completedCommissions = await DailyCommission.countDocuments({ status: 'completed' });
      
      const totalAmount = await DailyCommission.aggregate([
        { $group: { _id: null, total: { $sum: "$totalCommission" } } }
      ]);
      
      const totalPaid = await DailyCommission.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPaid" } } }
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysCommissions = await DailyCommission.countDocuments({
        status: 'active',
        nextPaymentDate: { $lte: today },
        daysRemaining: { $gt: 0 }
      });

      return NextResponse.json(
        {
          statistics: {
            totalCommissions,
            activeCommissions,
            completedCommissions,
            totalCommissionAmount: totalAmount[0]?.total || 0,
            totalPaidAmount: totalPaid[0]?.total || 0,
            todaysCommissions
          }
        },
        {
          status: 200,
          headers: corsHeaders(),
        }
      );

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error) {
    console.error("Daily Commission Statistics API error:", error);
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
