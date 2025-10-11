import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getAuthUserId(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

// Commission structure for MLM levels
const COMMISSION_RATES = {
  1: 0.03, // Level 1: 3%
  2: 0.01, // Level 2: 1%
  3: 0.01, // Level 3: 1%
  4: 0.0025, // Level 4-10: 0.25%
  5: 0.0025,
  6: 0.0025,
  7: 0.0025,
  8: 0.0025,
  9: 0.0025,
  10: 0.0025,
  // Levels 11+ get no commission
};

function calculateTotalCommissions(purchaseAmount) {
  // Calculate total commission percentage across all levels
  let totalCommissionRate = 0;
  for (let level = 1; level <= 10; level++) {
    if (COMMISSION_RATES[level]) {
      totalCommissionRate += COMMISSION_RATES[level];
    }
  }
  return purchaseAmount * totalCommissionRate;
}

async function distributeCommissions(buyerId, purchaseAmount) {
  const commissions = [];
  let currentUser = await User.findById(buyerId);
  let level = 1;

  // Update buyer's direct members volume (their own purchase)
  await User.findOneAndUpdate(
    { _id: buyerId },
    {
      $inc: { 
        directMembersVolume: purchaseAmount,
        totalMembersVolume: purchaseAmount
      }
    }
  );

  while (currentUser && currentUser.sponsor && level <= 10) {
    // Get the sponsor (parent) at this level
    const sponsor = await User.findById(currentUser.sponsor);
    if (!sponsor) break;

    // Calculate commission for this level
    const commissionRate = COMMISSION_RATES[level];
    if (commissionRate) {
      const commissionAmount = purchaseAmount * commissionRate;

      // Update sponsor's balance and volume tracking
      const updatedSponsor = await User.findOneAndUpdate(
        { _id: sponsor._id },
        {
          $inc: {
            "wallet.balance": commissionAmount,
            ...(level === 1 
              ? { 
                  sponsoredMembersVolume: purchaseAmount,
                  totalMembersVolume: purchaseAmount
                }
              : { 
                  totalMembersVolume: purchaseAmount
                })
          },
        },
        { new: true }
      );

      if (updatedSponsor) {
        commissions.push({
          level,
          sponsorId: sponsor.memberId,
          sponsorName: sponsor.name,
          commissionRate: `${(commissionRate * 100).toFixed(2)}%`,
          commissionAmount: commissionAmount.toFixed(2),
          newBalance: (updatedSponsor.wallet?.balance || 0).toFixed(2),
          volumeAdded: purchaseAmount.toFixed(2),
        });
      }
    }

    // Move to next level
    currentUser = sponsor;
    level++;
  }

  return commissions;
}

export async function POST(request) {
  try {
    await dbConnect();

    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { usdAmount, bnbAmount, packages, bnbPrice } = await request.json();

    if (!usdAmount || !bnbAmount || !packages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First, calculate total commissions that will be paid
    const purchaseAmount = parseFloat(usdAmount);
    const totalCommissions = calculateTotalCommissions(purchaseAmount);

    // The buyer gets the remaining amount after commissions are deducted
    const buyerAmount = purchaseAmount - totalCommissions;

    // Update buyer's wallet balance with the net amount
    const currentBalance = user.wallet?.balance || 0;
    const newBalance = currentBalance + buyerAmount;

    const updated = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "wallet.balance": newBalance,
          package: `${packages}x100USD`, // Update package info
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update balance" },
        { status: 400 }
      );
    }

    // Distribute commissions to upline sponsors
    const commissions = await distributeCommissions(userId, purchaseAmount);

    return NextResponse.json(
      {
        message: "Purchase simulated successfully and commissions distributed",
        user: {
          memberId: updated.memberId,
          name: updated.name,
          wallet: {
            balance: updated.wallet?.balance || newBalance,
            address: updated.wallet?.address || "",
          },
          package: updated.package,
        },
        transaction: {
          usdAmount: parseFloat(usdAmount),
          bnbAmount: parseFloat(bnbAmount),
          bnbPrice: parseFloat(bnbPrice),
          packages: packages,
          timestamp: new Date().toISOString(),
        },
        commissions: commissions,
        commissionsDistributed: commissions.length,
        totalCommissionsPaid: commissions
          .reduce((sum, c) => sum + parseFloat(c.commissionAmount), 0)
          .toFixed(2),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Simulate purchase error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
