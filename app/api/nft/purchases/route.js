import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import DailyCommission from "@/models/DailyCommission";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

function getAuthUserId() {
  const headersList = headers();
  const authorization = headersList.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    await dbConnect();
    const user = await User.findById(userId).select("memberId");
    if (!user) {
      return NextResponse.json({ purchases: [] }, { status: 200, headers: corsHeaders() });
    }

    const purchases = await NftPurchase.find({ userId }).sort({ purchasedAt: 1 });
    return NextResponse.json({ purchases }, { status: 200, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(request) {
  try {
    const userId = getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    const body = await request.json().catch(() => ({}));
    const { code, series, price, purchasedAt } = body || {};

    if (!code || !series) {
      return NextResponse.json({ error: "code and series are required" }, { status: 400, headers: corsHeaders() });
    }

    await dbConnect();
    const user = await User.findById(userId).select("memberId sponsor wallet.balance walletBalance");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders() });
    }

    // Create NFT purchase record
    const doc = await NftPurchase.create({
      userId,
      memberId: user.memberId || "",
      code,
      series,
      price: typeof price === "number" ? price : 0,
      purchasedAt: purchasedAt ? new Date(purchasedAt) : new Date(),
    });

    // Calculate NFT reward and multi-level commissions (10 levels)
    const nftReward = 100;
    const COMMISSION_RATES = [
      0.10, // L1
      0.03, // L2
      0.02, // L3
      0.01, // L4
      0.01, // L5
      0.01, // L6
      0.005, // L7
      0.005, // L8
      0.005, // L9
      0.005, // L10
    ];
    const totalCommissions = COMMISSION_RATES.reduce((sum, r) => sum + r, 0) * nftReward; // 20%
    const userReward = nftReward - totalCommissions; // $80
    const currentBalance = user.wallet?.balance || user.walletBalance || 0;
    const newBalance = currentBalance + userReward;

    console.log(`NFT Purchase Debug - User: ${user.memberId}`);
    console.log(`Current wallet.balance: $${user.wallet?.balance || 0}`);
    console.log(`Current walletBalance: $${user.walletBalance || 0}`);
    console.log(`User Reward: $${userReward}`);
    console.log(`New Balance: $${newBalance}`);

    // Update both wallet balance fields to ensure consistency
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { 
        $set: { 
          "wallet.balance": newBalance,
          "walletBalance": newBalance
        } 
      },
      { new: true }
    );

    console.log(`Updated wallet.balance: $${updatedUser?.wallet?.balance}`);
    console.log(`Updated walletBalance: $${updatedUser?.walletBalance}`);

    // Distribute commissions (up to 10 levels) and update member volumes
    const commissions = [];
    let currentUserForUpline = user;
    
    // Update buyer's direct members volume (their own purchase)
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { 
          directMembersVolume: nftReward,
          totalMembersVolume: nftReward
        }
      }
    );

    // Create daily commission records for sponsors (up to 10 levels)
    console.log(`Starting commission distribution for user: ${user.memberId}`);
    console.log(`Current user for upline: ${currentUserForUpline.memberId} (${currentUserForUpline.name})`);
    
    for (let level = 1; level <= 10; level++) {
      const rate = COMMISSION_RATES[level - 1];
      if (!rate) {
        console.log(`No rate for level ${level}, breaking`);
        break;
      }
      
      console.log(`Level ${level}: Looking for sponsor of ${currentUserForUpline.memberId}`);
      const sponsorIdAtLevel = currentUserForUpline?.sponsor;
      if (!sponsorIdAtLevel) {
        console.log(`No sponsor at level ${level} for ${currentUserForUpline.memberId}, breaking`);
        break;
      }

      console.log(`Level ${level}: Found sponsor ID: ${sponsorIdAtLevel}`);
      const sponsorUser = await User.findById(sponsorIdAtLevel);
      if (!sponsorUser) {
        console.log(`Sponsor user not found at level ${level} with ID ${sponsorIdAtLevel}, breaking`);
        break;
      }

      console.log(`Processing level ${level} sponsor: ${sponsorUser.memberId} (${sponsorUser.name})`);

      const totalCommission = nftReward * rate;
      const dailyAmount = totalCommission / 5; // Distribute over 5 minutes for demo
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMinutes(endDate.getMinutes() + 5); // 5 minutes for demo

      // Create daily commission record
      const dailyCommission = new DailyCommission({
        userId: userId,
        memberId: user.memberId,
        sponsorId: sponsorUser._id,
        sponsorMemberId: sponsorUser.memberId,
        level: level,
        nftPurchaseId: doc._id,
        totalCommission: totalCommission,
        dailyAmount: dailyAmount,
        totalDays: 5,
        daysPaid: 0,
        daysRemaining: 5,
        totalPaid: 0,
        remainingAmount: totalCommission,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        nextPaymentDate: startDate
      });

      await dailyCommission.save();
      console.log(`Created daily commission for level ${level}: ${sponsorUser.memberId} - $${dailyAmount.toFixed(4)}/5min for 5 minutes`);

      // Immediate first-day payout so sponsors see today's amount right away
      const sponsorCurrentBalance = sponsorUser.wallet?.balance || sponsorUser.walletBalance || 0;
      const sponsorNewBalance = sponsorCurrentBalance + dailyAmount;
      const incomeField = level > 1 ? 'levelIncome' : 'sponsorIncome';
      console.log(`Updating ${incomeField} for ${sponsorUser.memberId} by $${dailyAmount.toFixed(4)}`);

      await User.findOneAndUpdate(
        { _id: sponsorUser._id },
        {
          $set: {
            "wallet.balance": sponsorNewBalance,
            "walletBalance": sponsorNewBalance
          },
          $inc: {
            [incomeField]: dailyAmount
          }
        }
      );

      await DailyCommission.findOneAndUpdate(
        { _id: dailyCommission._id },
        {
          $inc: {
            daysPaid: 1,
            daysRemaining: -1,
            totalPaid: dailyAmount,
            remainingAmount: -dailyAmount
          },
          $set: {
            lastPaymentDate: startDate,
            nextPaymentDate: new Date(Date.now() + 5 * 60 * 1000) // next 5 minutes for demo
          }
        }
      );

      // Update sponsor's volume tracking (but not remaining income yet)
      const volumeUpdate = level === 1 
        ? { 
            sponsoredMembersVolume: (sponsorUser.sponsoredMembersVolume || 0) + nftReward,
            totalMembersVolume: (sponsorUser.totalMembersVolume || 0) + nftReward
          }
        : { 
            totalMembersVolume: (sponsorUser.totalMembersVolume || 0) + nftReward
          };

      await User.findOneAndUpdate(
        { _id: sponsorUser._id },
        {
          $inc: volumeUpdate
        }
      );

      commissions.push({
        level,
        sponsorId: sponsorUser.memberId,
        sponsorName: sponsorUser.name,
        commissionRate: `${(rate * 100).toFixed(2)}%`,
        totalCommission: totalCommission.toFixed(2),
        dailyAmount: dailyAmount.toFixed(2),
        volumeAdded: nftReward.toFixed(2),
        paymentSchedule: '5 minutes (demo)'
      });

      // Move up the tree
      console.log(`Moving up to next level. New currentUserForUpline: ${sponsorUser.memberId}`);
      currentUserForUpline = sponsorUser;
    }
    
    console.log(`Commission distribution completed. Processed ${commissions.length} levels.`);

    return NextResponse.json({ 
      purchase: doc,
      user: {
        memberId: updatedUser.memberId,
        wallet: {
          balance: updatedUser.wallet?.balance || newBalance,
        },
      },
      userReward: Number(userReward.toFixed(2)),
      nftReward,
      commissions,
      totalCommissionsPaid: commissions.reduce((sum, c) => sum + parseFloat(c.commissionAmount), 0).toFixed(2),
    }, { status: 201, headers: corsHeaders() });
  } catch (error) {
    // Handle duplicate purchase gracefully
    if (error && error.code === 11000) {
      return NextResponse.json({ error: "Already purchased" }, { status: 409, headers: corsHeaders() });
    }
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500, headers: corsHeaders() });
  }
}


