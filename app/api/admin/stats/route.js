import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// GET - Fetch admin dashboard statistics
export async function GET() {
  try {
    console.log("Admin Stats API called");
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Verify this is an admin token
      if (!decoded.isAdmin || decoded.role !== 'admin') {
        return NextResponse.json(
          { error: "Admin access required" }, 
          { 
            status: 403,
            headers: corsHeaders()
          }
        );
      }

      console.log("Admin stats request verified");

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch member statistics
      const totalMembers = await User.countDocuments();
      const activeMembers = await User.countDocuments({ isActivated: true });

      // Inactive defined as users with 0 NFT purchases
      const purchasedUserIds = await NftPurchase.distinct('userId');
      const inactiveMembers = await User.countDocuments({ _id: { $nin: purchasedUserIds } });
      const blockedMembers = await User.countDocuments({ isBlocked: true });
      const todayActivations = await User.countDocuments({
        activatedAt: { $gte: today, $lt: tomorrow }
      });

      // Calculate financial statistics from user data
      const users = await User.find({}).select('wallet fundBalance totalDeposit totalWithdrawal sponsorIncome levelIncome roiIncome committeeIncome rewardIncome');
      
      let totalWalletBalance = 0;
      let totalFundBalance = 0;
      let totalActivation = 0;
      let totalUpgrade = 0;
      let totalWithdrawal = 0;
      let totalSponsorIncome = 0;
      let totalLevelIncome = 0;
      let totalRoiIncome = 0;
      let totalCommitteeIncome = 0;
      let totalRewardIncome = 0;

      users.forEach(user => {
        totalWalletBalance += user.wallet?.balance || 0;
        totalFundBalance += user.fundBalance || 0;
        totalActivation += user.totalDeposit || 0;
        totalWithdrawal += user.totalWithdrawal || 0;
        totalSponsorIncome += user.sponsorIncome || 0;
        totalLevelIncome += user.levelIncome || 0;
        totalRoiIncome += user.roiIncome || 0;
        totalCommitteeIncome += user.committeeIncome || 0;
        totalRewardIncome += user.rewardIncome || 0;
      });

      // For today's transactions, we'll need to implement transaction tracking
      // For now, using mock data for today's specific transactions
      const todayUpgrade = 0.00; // This would come from transaction records
      const todayWithdrawalAmount = 0.00; // This would come from transaction records

      // Calculate withdrawal deductions (assuming 10% deduction)
      const withdrawalGross = totalWithdrawal;
      const withdrawalDeduction = totalWithdrawal * 0.1;
      const withdrawalNet = totalWithdrawal - withdrawalDeduction;

      // Coin statistics (these would typically come from separate coin/wallet collections)
      // For now, calculating from user data or using mock data
      const buyCoin = 149876; // This would come from coin transactions
      const freezeCoin = 128575.00; // This would come from coin freeze records
      const coinWallet = 7826.30; // This would come from coin wallet balances
      const stakingCoin = 7826.30; // This would come from staking records

      const stats = {
        members: {
          total: totalMembers,
          active: activeMembers,
          inactive: inactiveMembers,
          blocked: blockedMembers,
          todayActivation: todayActivations
        },
        financial: {
          todayUpgrade: todayUpgrade,
          todayWithdrawal: todayWithdrawalAmount,
          totalWalletBalance: totalWalletBalance,
          totalActivation: totalActivation,
          totalUpgrade: totalUpgrade,
          totalWithdrawal: totalWithdrawal,
          totalFundBalance: totalFundBalance
        },
        coins: {
          buyCoin: buyCoin,
          freezeCoin: freezeCoin,
          coinWallet: coinWallet,
          stakingCoin: stakingCoin
        },
        income: {
          sponsorIncome: totalSponsorIncome,
          levelIncome: totalLevelIncome,
          roiIncome: totalRoiIncome,
          committeeIncome: totalCommitteeIncome,
          rewardIncome: totalRewardIncome,
          withdrawalGross: withdrawalGross,
          withdrawalNet: withdrawalNet,
          withdrawalDeduction: withdrawalDeduction
        }
      };

      console.log("Stats calculated:", stats);

      return NextResponse.json(
        { stats },
        { 
          status: 200,
          headers: corsHeaders()
        }
      );

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

  } catch (error) {
    console.error("Admin Stats API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}
