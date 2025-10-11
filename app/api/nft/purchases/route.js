import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
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

    for (let level = 1; level <= 10; level++) {
      const rate = COMMISSION_RATES[level - 1];
      if (!rate) break;
      const sponsorIdAtLevel = currentUserForUpline?.sponsor;
      if (!sponsorIdAtLevel) break;

      const sponsorUser = await User.findById(sponsorIdAtLevel);
      if (!sponsorUser) break;

      const commissionAmount = nftReward * rate;
      const sponsorCurrentBalance = sponsorUser.wallet?.balance || sponsorUser.walletBalance || 0;
      const sponsorNewBalance = sponsorCurrentBalance + commissionAmount;

      // Update sponsor's volume tracking
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
          $set: {
            "wallet.balance": sponsorNewBalance,
            "walletBalance": sponsorNewBalance,
          },
          $inc: {
            ...(level === 1 
              ? { 
                  sponsorIncome: commissionAmount,
                  sponsoredMembersVolume: nftReward,
                  totalMembersVolume: nftReward
                }
              : { 
                  levelIncome: commissionAmount,
                  totalMembersVolume: nftReward
                })
          }
        }
      );

      commissions.push({
        level,
        sponsorId: sponsorUser.memberId,
        sponsorName: sponsorUser.name,
        commissionRate: `${(rate * 100).toFixed(2)}%`,
        commissionAmount: commissionAmount.toFixed(2),
        volumeAdded: nftReward.toFixed(2),
      });

      // Move up the tree
      currentUserForUpline = sponsorUser;
    }

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


