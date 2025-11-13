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

// GET - Get level income details for user
export async function GET(request) {
  try {
    console.log("Level Income Details API called");

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
      console.log("User token verified");

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Get user
      const user = await User.findById(decoded.userId).select('memberId name sponsor');
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      console.log(`Getting level income details for user: ${user.memberId}`);

      // We'll traverse referrals breadth-first up to 10 levels (L1..L10)
      // Instead of aggregating by referral, we'll return EACH individual DailyCommission entry
      // so users can see level income history for every NFT purchase/rebuy
      
      const levelIncomeDetails = [];

      // Traverse up to 10 levels and collect individual commission records
      let currentLevelUsers = await User.find({ sponsor: user._id }).select('memberId name email avatar _id');

      for (let level = 1; level <= 10; level++) {
        if (!currentLevelUsers || currentLevelUsers.length === 0) break;

        console.log(`Level ${level}: Processing ${currentLevelUsers.length} users`);

        // Get all DailyCommission records for users in this level
        const userIds = currentLevelUsers.map(u => u._id);
        const dailyCommissions = await DailyCommission.find({
          sponsorId: user._id,
          userId: { $in: userIds },
          level: level  // Match the level to ensure consistency
        })
          .populate('userId', 'memberId name email avatar')
          .populate('nftPurchaseId')
          .sort({ createdAt: -1 });

        console.log(`Found ${dailyCommissions.length} individual commission records for level ${level}`);

        // Create a separate entry for EACH DailyCommission record (each NFT purchase/rebuy)
        for (const dailyComm of dailyCommissions) {
          const referralUser = dailyComm.userId;
          const defaultCommissionRates = {
            1: 0.10,
            2: 0.01,
            3: 0.01,
            4: 0.005,
            5: 0.005,
            6: 0.0025,
            7: 0.0025,
            8: 0.001,
            9: 0.001,
            10: 0.0005
          };
          const commissionRate = defaultCommissionRates[level] || 0;

          levelIncomeDetails.push({
            level: level,
            referral: {
              memberId: referralUser?.memberId || 'Unknown',
              name: referralUser?.name || 'Unknown',
              email: referralUser?.email || 'N/A',
              avatar: referralUser?.avatar || null
            },
            commissionRate: `${(commissionRate * 100).toFixed(1)}%`,
            totalCommission: dailyComm.totalCommission.toFixed(4),
            totalPaid: dailyComm.totalPaid.toFixed(4),
            remainingAmount: dailyComm.remainingAmount.toFixed(4),
            dailyAmount: dailyComm.dailyAmount.toString(),
            daysRemaining: dailyComm.daysRemaining,
            daysPaid: dailyComm.daysPaid,
            lastPayment: dailyComm.lastPaymentDate || null,
            nextPayment: dailyComm.nextPaymentDate || null,
            nftPurchaseId: dailyComm.nftPurchaseId?._id || dailyComm.nftPurchaseId,
            nftPrice: dailyComm.nftPurchaseId?.price || 0,
            purchaseDate: dailyComm.nftPurchaseId?.createdAt || dailyComm.createdAt,
            status: dailyComm.status,
            createdAt: dailyComm.createdAt,
            hasPurchases: true
          });
        }

        // Find next level users (those sponsored by current level users)
        const currentLevelIds = currentLevelUsers.map(u => u._id);
        const nextLevelUsers = await User.find({ sponsor: { $in: currentLevelIds } }).select('memberId name email avatar _id');
        currentLevelUsers = nextLevelUsers;
      }

      // Sort all entries by date (newest first)
      levelIncomeDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Sort all entries by date (newest first)
      levelIncomeDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Calculate summary statistics (summing from individual entries)
      const totalLevelIncome = levelIncomeDetails.reduce((sum, entry) => sum + parseFloat(entry.totalPaid), 0);
      const totalRemaining = levelIncomeDetails.reduce((sum, entry) => sum + parseFloat(entry.remainingAmount), 0);
      const totalDailyAmount = levelIncomeDetails.reduce((sum, entry) => sum + parseFloat(entry.dailyAmount), 0);
      const totalCommissionGenerated = levelIncomeDetails.reduce((sum, entry) => sum + parseFloat(entry.totalCommission), 0);

      return NextResponse.json(
        {
          user: {
            memberId: user.memberId,
            name: user.name
          },
          levelIncomeDetails,
          summary: {
            totalEntries: levelIncomeDetails.length,
            totalLevelIncome: totalLevelIncome.toFixed(4),
            totalRemaining: totalRemaining.toFixed(4),
            totalDailyAmount: totalDailyAmount.toFixed(4),
            totalCommissionGenerated: totalCommissionGenerated.toFixed(4),
            activeCommissions: levelIncomeDetails.filter(e => e.status === 'active').length
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
    console.error("Level Income Details API error:", error);
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
