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

// Helper function to distribute spot income to 3 levels
async function distributeSpotIncome(sponsorId, actionMemberId, actionType = 'nft_purchase') {
  console.log(`=== Starting spot income distribution ===`);
  console.log(`For: ${actionMemberId}, Action: ${actionType}, SponsorId: ${sponsorId}`);
  
  const spotIncomeLevels = [
    { amount: 3, condition: 'nft_purchased' },  // L1: $3 - must have NFT purchased
    { amount: 1, condition: '3_directs' },     // L2: $1 - must have 3 direct members
    { amount: 1, condition: '2_directs' }      // L3: $1 - must have 2 direct members
  ];
  let currentSponsorId = sponsorId;
  let totalPaid = 0;

  for (let level = 0; level < spotIncomeLevels.length; level++) {
    const { amount: spotAmount, condition } = spotIncomeLevels[level];
    
    if (!currentSponsorId) {
      console.log(`No sponsor at level ${level + 1}`);
      break;
    }

    const sponsor = await User.findById(currentSponsorId);
    if (!sponsor) {
      console.log(`Sponsor not found at level ${level + 1}`);
      break;
    }

    // Check conditions based on level
    let meetsCondition = false;
    let conditionNotMet = '';

    if (condition === 'nft_purchased') {
      // Level 1: Check if sponsor has at least one NFT purchased
      const NftPurchase = (await import("@/models/NftPurchase")).default;
      const hasNft = await NftPurchase.exists({ userId: sponsor._id });
      console.log(`L1 Sponsor ${sponsor.memberId}: Checking if has NFT purchased - exists: ${hasNft !== null}`);
      meetsCondition = hasNft !== null;
      if (!meetsCondition) {
        conditionNotMet = 'no NFT purchased';
      }
    } else if (condition === '3_directs') {
      // Level 2: Check if sponsor has at least 3 direct members
      const directMemberCount = await User.countDocuments({ sponsor: sponsor._id });
      console.log(`L2 Sponsor ${sponsor.memberId}: Direct members count = ${directMemberCount}, needs >= 3`);
      meetsCondition = directMemberCount >= 3;
      if (!meetsCondition) {
        conditionNotMet = `only ${directMemberCount} direct members (needs 3)`;
      }
    } else if (condition === '2_directs') {
      // Level 3: Check if sponsor has at least 2 direct members
      const directMemberCount = await User.countDocuments({ sponsor: sponsor._id });
      console.log(`L3 Sponsor ${sponsor.memberId}: Direct members count = ${directMemberCount}, needs >= 2`);
      meetsCondition = directMemberCount >= 2;
      if (!meetsCondition) {
        conditionNotMet = `only ${directMemberCount} direct members (needs 2)`;
      }
    }

    if (meetsCondition) {
      console.log(`Distributing spot income at Level ${level + 1}: $${spotAmount} to ${sponsor.memberId} for ${actionType} by ${actionMemberId}`);

      // Update sponsor's balance and spot income
      await User.findByIdAndUpdate(currentSponsorId, {
        $inc: {
          'wallet.balance': spotAmount,
          'walletBalance': spotAmount,
          'rewardIncome': spotAmount
        }
      });

      totalPaid += spotAmount;
    } else {
      console.log(`Level ${level + 1} sponsor ${sponsor.memberId} skipped: ${conditionNotMet}`);
    }

    currentSponsorId = sponsor.sponsor; // Move up to next level
  }

  console.log(`Total spot income distributed: $${totalPaid} for ${actionType} by ${actionMemberId}`);
  return totalPaid;
}

export async function GET() {
  try {
    const userId = getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    await dbConnect();
    const user = await User.findById(userId).select("memberId wallet.balance walletBalance");
    if (!user) {
      return NextResponse.json({ purchases: [] }, { status: 200, headers: corsHeaders() });
    }

    const purchases = await NftPurchase.find({ userId }).sort({ purchasedAt: 1 });
    
    // Get current wallet balance to determine NFT status
    const walletBalance = user.wallet?.balance || user.walletBalance || 0;
    
    return NextResponse.json({ purchases, walletBalance }, { status: 200, headers: corsHeaders() });
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
      price: typeof price === "number" ? price : 100, // Default price to $100
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
    const currentBalance = user.wallet?.balance || user.walletBalance || 0;
    // User gets full $100 in wallet - commissions are deducted invisibly and paid to sponsors over 365 days
    const newBalance = currentBalance + nftReward;

    console.log(`NFT Purchase Debug - User: ${user.memberId}`);
    console.log(`Current wallet.balance: $${user.wallet?.balance || 0}`);
    console.log(`Current walletBalance: $${user.walletBalance || 0}`);
    console.log(`User Reward: $${nftReward} (full amount - commissions are invisible)`);
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

    // Distribute spot income to 3 levels when NFT is purchased: Level 1 = $3, Level 2 = $1, Level 3 = $1
    if (user.sponsor) {
      await distributeSpotIncome(user.sponsor, user.memberId, 'nft_purchase');
    }

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

    // Distribute commissions instantly (up to 10 levels)
    console.log(`Starting instant commission distribution for user: ${user.memberId}`);
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

      // Check conditions for commission distribution
      let canReceiveCommission = true;
      let conditionNotMet = '';
      
      if (level === 2) {
        // Level 2 requires 3 direct members
        const directMemberCount = await User.countDocuments({ sponsor: sponsorUser._id });
        if (directMemberCount < 3) {
          canReceiveCommission = false;
          conditionNotMet = 'needs 3 direct members';
          console.log(`Level 2 sponsor ${sponsorUser.memberId} skipped: Has only ${directMemberCount} direct members (needs 3)`);
        }
      } else if (level === 3) {
        // Level 3 requires 2 direct members
        const directMemberCount = await User.countDocuments({ sponsor: sponsorUser._id });
        if (directMemberCount < 2) {
          canReceiveCommission = false;
          conditionNotMet = 'needs 2 direct members';
          console.log(`Level 3 sponsor ${sponsorUser.memberId} skipped: Has only ${directMemberCount} direct members (needs 2)`);
        }
      } else if (level >= 4 && level <= 10) {
        // Levels 4-10 require active trade (NFT purchased within last 48 hours)
        const NftPurchase = (await import("@/models/NftPurchase")).default;
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const recentPurchase = await NftPurchase.findOne({
          userId: sponsorUser._id,
          purchasedAt: { $gte: fortyEightHoursAgo }
        });
        
        if (!recentPurchase) {
          canReceiveCommission = false;
          conditionNotMet = 'needs active trade (NFT within 48h)';
          console.log(`Level ${level} sponsor ${sponsorUser.memberId} skipped: No NFT purchased within last 48 hours`);
        }
      }
      
      if (!canReceiveCommission) {
        console.log(`Skipping commission for level ${level} due to unmet condition: ${conditionNotMet}`);
        // Still move up to next level but skip this commission
        commissions.push({
          level,
          sponsorId: sponsorUser.memberId,
          sponsorName: sponsorUser.name,
          commissionRate: `${(rate * 100).toFixed(2)}%`,
          totalCommission: '0.00',
          dailyAmount: '0.00',
          commissionAmount: '0.00',
          incomeType: 'levelIncome',
          volumeAdded: nftReward.toFixed(2),
          paymentSchedule: 'Skipped',
          reason: conditionNotMet
        });
        currentUserForUpline = sponsorUser;
        continue;
      }

      const totalCommission = nftReward * rate;
      const TOTAL_INTERVALS = 365; // Represents 30 hours and 25 minutes (365 * 5 minutes)
      const dailyAmount = totalCommission / TOTAL_INTERVALS; // Distribute over new total intervals
      const startDate = new Date();
      const endDate = new Date(Date.now() + (TOTAL_INTERVALS * 5 * 60 * 1000)); // Total duration: 365 * 5 minutes

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
        totalDays: TOTAL_INTERVALS, // Use TOTAL_INTERVALS
        daysPaid: 0,
        daysRemaining: TOTAL_INTERVALS, // Use TOTAL_INTERVALS
        totalPaid: 0,
        remainingAmount: totalCommission,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        nextPaymentDate: new Date(Date.now() + 5 * 60 * 1000) // Next payment in 5 minutes
      });

      await dailyCommission.save();
      console.log(`Created daily commission for level ${level}: ${sponsorUser.memberId} - $${dailyAmount.toFixed(4)}/5 minutes for ${TOTAL_INTERVALS * 5} minutes`);

      // Immediate first-day payout so sponsors see today's amount right away (first 5-minute interval)
      const sponsorCurrentBalance = sponsorUser.wallet?.balance || sponsorUser.walletBalance || 0;
      const sponsorNewBalance = sponsorCurrentBalance + dailyAmount;
      const incomeField = 'levelIncome';
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
            nextPaymentDate: new Date(Date.now() + 5 * 60 * 1000) // next 5 minutes
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
        dailyAmount: dailyAmount.toFixed(4),
        commissionAmount: dailyAmount.toFixed(4), // Immediate first-day payout for display
        incomeType: incomeField,
        volumeAdded: nftReward.toFixed(2),
        paymentSchedule: '5 minutes'
      });

      // Move up the tree
      console.log(`Moving up to next level. New currentUserForUpline: ${sponsorUser.memberId}`);
      currentUserForUpline = sponsorUser;
    }
    
    console.log(`Commission distribution completed. Processed ${commissions.length} levels.`);

    // Calculate total commissions to be paid over 5 minutes (including first minute payout)
    const totalCommissionsToPay = commissions.reduce((sum, c) => sum + parseFloat(c.totalCommission), 0);
    
    return NextResponse.json({ 
      purchase: doc,
      user: {
        memberId: updatedUser.memberId,
        wallet: {
          balance: updatedUser.wallet?.balance || newBalance,
        },
      },
      userReward: Number(nftReward.toFixed(2)), // Show full $100 to user (commissions are invisible)
      nftReward,
      commissions,
      totalCommissionsPaid: totalCommissionsToPay.toFixed(2),
    }, { status: 201, headers: corsHeaders() });
  } catch (error) {
    // Handle duplicate purchase gracefully
    if (error && error.code === 11000) {
      return NextResponse.json({ error: "Already purchased" }, { status: 409, headers: corsHeaders() });
    }
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500, headers: corsHeaders() });
  }
}


