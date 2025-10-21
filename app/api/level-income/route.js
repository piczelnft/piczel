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

      // Get all users who used this user's sponsor ID (direct referrals)
      const directReferrals = await User.find({ sponsor: user._id }).select('memberId name email avatar');
      
      // Build level income details showing who is generating commissions FOR this user
      const levelIncomeDetails = [];
      
      // For each direct referral, show how much commission they're generating
      for (const referral of directReferrals) {
        console.log(`Processing referral: ${referral.memberId} (${referral.name})`);
        
        // Get daily commission data where this user is the sponsor (earning from this referral)
        const dailyCommissions = await DailyCommission.find({
          sponsorId: user._id, // Current user is the sponsor (earning)
          userId: referral._id, // This referral is generating the commission
          // Removed level and status filters to see all records
        }).populate('nftPurchaseId').sort({ createdAt: -1 });

        console.log(`Found ${dailyCommissions.length} daily commissions for referral ${referral.memberId}`);
        console.log(`Commission query: sponsorId=${user._id}, userId=${referral._id} (no level/status filter)`);
        
        if (dailyCommissions.length > 0) {
          console.log(`Sample commission data:`, {
            totalCommission: dailyCommissions[0].totalCommission,
            totalPaid: dailyCommissions[0].totalPaid,
            remainingAmount: dailyCommissions[0].remainingAmount,
            dailyAmount: dailyCommissions[0].dailyAmount
          });
        }

        // Calculate total commission amounts
        const totalCommission = dailyCommissions.reduce((sum, comm) => sum + comm.totalCommission, 0);
        const totalPaid = dailyCommissions.reduce((sum, comm) => sum + comm.totalPaid, 0);
        const remainingAmount = dailyCommissions.reduce((sum, comm) => sum + comm.remainingAmount, 0);
        const dailyAmount = dailyCommissions.reduce((sum, comm) => sum + comm.dailyAmount, 0);

        console.log(`Calculated amounts for ${referral.memberId}:`, {
          totalCommission,
          totalPaid,
          remainingAmount,
          dailyAmount
        });

        // Get commission rate for level 1 (direct referrals)
        const commissionRate = 0.10; // 10% for direct referrals

        // Get source information (NFT purchases that generated this income)
        const sourceInfo = dailyCommissions.map(comm => ({
          nftPurchaseId: comm.nftPurchaseId?._id || comm.nftPurchaseId,
          purchaseDate: comm.nftPurchaseId?.createdAt || comm.createdAt,
          nftPrice: comm.nftPurchaseId?.price || 100,
          commissionAmount: comm.totalCommission
        }));

        // Always add the referral, even if they have no commissions yet
        levelIncomeDetails.push({
          level: 1, // All direct referrals are level 1
          referral: { // Changed from 'sponsor' to 'referral'
            memberId: referral.memberId,
            name: referral.name,
            email: referral.email,
            avatar: referral.avatar
          },
          commissionRate: `${(commissionRate * 100).toFixed(1)}%`,
          totalCommission: totalCommission.toFixed(2),
          totalPaid: totalPaid.toFixed(2),
          remainingAmount: remainingAmount.toFixed(2),
          dailyAmount: dailyAmount.toFixed(2),
          activeCommissions: dailyCommissions.length,
          lastPayment: dailyCommissions.length > 0 ? dailyCommissions[0].lastPaymentDate : null,
          nextPayment: dailyCommissions.length > 0 ? dailyCommissions[0].nextPaymentDate : null,
          sourceInfo: sourceInfo,
          hasPurchases: dailyCommissions.length > 0
        });

        console.log(`Direct referral ${referral.memberId} (${referral.name}) generating $${totalCommission.toFixed(2)} commission`);
      }

      // Calculate summary statistics
      const totalLevelIncome = levelIncomeDetails.reduce((sum, level) => sum + parseFloat(level.totalPaid), 0);
      const totalRemaining = levelIncomeDetails.reduce((sum, level) => sum + parseFloat(level.remainingAmount), 0);
      const totalDailyAmount = levelIncomeDetails.reduce((sum, level) => sum + parseFloat(level.dailyAmount), 0);

      return NextResponse.json(
        {
          user: {
            memberId: user.memberId,
            name: user.name
          },
          levelIncomeDetails,
          summary: {
            totalLevels: levelIncomeDetails.length,
            totalLevelIncome: totalLevelIncome.toFixed(2),
            totalRemaining: totalRemaining.toFixed(2),
            totalDailyAmount: totalDailyAmount.toFixed(2),
            activeCommissions: levelIncomeDetails.reduce((sum, level) => sum + level.activeCommissions, 0)
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
