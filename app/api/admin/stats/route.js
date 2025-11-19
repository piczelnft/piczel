import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import Withdrawal from "@/models/Withdrawal";
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
      const inactiveMembers = await User.countDocuments({ isActivated: false });
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
        // totalWithdrawal will be calculated from Withdrawal collection below
        totalSponsorIncome += user.sponsorIncome || 0;
        totalLevelIncome += user.levelIncome || 0;
        totalRoiIncome += user.roiIncome || 0;
        totalCommitteeIncome += user.committeeIncome || 0;
        totalRewardIncome += user.rewardIncome || 0;
      });

      // Calculate total withdrawals from Withdrawal collection (all completed withdrawals)
      const allCompletedWithdrawals = await Withdrawal.find({ status: 'completed' });
      totalWithdrawal = allCompletedWithdrawals.reduce((sum, withdrawal) => {
        return sum + (withdrawal.netAmount || withdrawal.amount || 0);
      }, 0);

      // Calculate today's withdrawals (amount given by admin to users today)
      // Check withdrawals that were completed today - use processedAt if available, otherwise updatedAt
      const todayWithdrawals = await Withdrawal.find({
        status: 'completed',
        $or: [
          { processedAt: { $gte: today, $lt: tomorrow } },
          { 
            $and: [
              { $or: [{ processedAt: null }, { processedAt: { $exists: false } }] },
              { updatedAt: { $gte: today, $lt: tomorrow } }
            ]
          }
        ]
      });
      
      const todayWithdrawalAmount = todayWithdrawals.reduce((sum, withdrawal) => {
        return sum + (withdrawal.netAmount || withdrawal.amount || 0);
      }, 0);

      // For today's transactions, we'll need to implement transaction tracking
      const todayUpgrade = 0.00; // This would come from transaction records

      // NFT Purchase Statistics
      const allNftPurchases = await NftPurchase.find({});
      let totalNftPurchaseAmount = 0;
      let todayNftPurchaseAmount = 0;
      let totalPayout = 0;

      // Calculate holding amount for an NFT based on its code (same logic as NFT market withdrawal page)
      const calculateHoldingAmount = (nftCode) => {
        const purchasePrice = 100; // $100 per NFT
        const number = parseInt(nftCode.substring(1)); // Extract number from code (A2 -> 2)
        
        // Calculate profit based on NFT number
        let profit = 0;
        if (number === 1) {
          profit = 5; // $5 profit for A1-J1
        } else if (number === 2) {
          profit = 10; // $10 profit for A2
        } else if (number === 3) {
          profit = 15; // $15 profit for A3
        } else if (number >= 4 && number <= 100) {
          profit = 20; // $20 profit for A4-A100
        }
        
        // Apply 25% tax on profit
        const profitAfterTax = profit - (profit * 0.25);
        const totalHolding = purchasePrice + profitAfterTax;
        
        return totalHolding;
      };

      // Calculate profit for each NFT
      const calculateNftProfit = (nftCode) => {
        const number = parseInt(nftCode.substring(1)); // Extract number from code (A2 -> 2)
        
        // Calculate profit based on NFT number
        let profit = 0;
        if (number === 1) {
          profit = 5; // $5 profit for A1-J1
        } else if (number === 2) {
          profit = 10; // $10 profit for A2
        } else if (number === 3) {
          profit = 15; // $15 profit for A3
        } else if (number >= 4 && number <= 100) {
          profit = 20; // $20 profit for A4-A100
        }
        
        return profit;
      };

      let totalNftProfitGenerated = 0;
      let totalNftProfitPaid = 0;

      allNftPurchases.forEach(purchase => {
        totalNftPurchaseAmount += purchase.price || 0;
        
        const nftCode = purchase.code || purchase.series || 'A1';
        const profit = calculateNftProfit(nftCode);
        
        // Add to total profit generated
        totalNftProfitGenerated += profit;
        
        // Calculate total payout for NFTs that haven't been paid out yet
        if (purchase.payoutStatus !== 'paid') {
          totalPayout += calculateHoldingAmount(nftCode);
        } else {
          // If paid, add to total profit paid
          totalNftProfitPaid += profit;
        }
        
        // Check if purchase was made today
        const purchaseDate = new Date(purchase.purchasedAt);
        purchaseDate.setHours(0, 0, 0, 0);
        if (purchaseDate.getTime() === today.getTime()) {
          todayNftPurchaseAmount += purchase.price || 0;
        }
      });

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
          totalFundBalance: totalFundBalance,
          totalNftPurchaseAmount: totalNftPurchaseAmount,
          todayNftPurchaseAmount: todayNftPurchaseAmount,
          totalPayout: totalPayout,
          totalNftProfitGenerated: totalNftProfitGenerated,
          totalNftProfitPaid: totalNftProfitPaid
        },
        coins: {
          buyCoin: buyCoin,
          freezeCoin: freezeCoin,
          coinWallet: coinWallet,
          stakingCoin: stakingCoin
        },
        income: {
          sponsorIncome: totalSponsorIncome,
          spotIncome: totalRewardIncome, // Spot income is stored in rewardIncome
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
