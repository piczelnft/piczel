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

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// Calculate holding wallet amount for an NFT
function calculateHoldingAmount(nftCode) {
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
}

// POST endpoint to process NFT payout
export async function POST(request) {
  try {
    const headersList = await headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if user is admin (admin token has userId: "admin" or role: "admin")
    await dbConnect();
    // Admin token might have userId: "admin" (string) or a real userId
    if (decoded.userId === "admin" || decoded.role === "admin" || decoded.isAdmin) {
      // Admin token is valid, proceed
    } else {
      // Check if it's a real user with admin role
      const adminUser = await User.findById(decoded.userId);
      if (!adminUser || adminUser.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403, headers: corsHeaders() }
        );
      }
    }

    const body = await request.json();
    const { userId, nftCode } = body;

    if (!userId || !nftCode) {
      return NextResponse.json(
        { error: "userId and nftCode are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Find the NFT purchase (mongoose will handle ObjectId conversion)
    let nftPurchase;
    try {
      nftPurchase = await NftPurchase.findOne({
        userId: userId,
        code: nftCode
      });
    } catch (err) {
      console.error("Error finding NFT purchase:", err);
      return NextResponse.json(
        { error: "Error finding NFT purchase", details: err.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    if (!nftPurchase) {
      return NextResponse.json(
        { error: "NFT purchase not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Check if already paid out (handle cases where payoutStatus might not exist)
    if (nftPurchase.payoutStatus && nftPurchase.payoutStatus === 'paid') {
      return NextResponse.json(
        { error: "This NFT has already been paid out" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Calculate holding amount (dummy payment - just mark as paid)
    const holdingAmount = calculateHoldingAmount(nftCode);

    // Mark NFT as paid out (dummy payment - no actual money transfer)
    // Use updateOne or findByIdAndUpdate with upsert:false
    try {
      const updateResult = await NftPurchase.updateOne(
        { _id: nftPurchase._id },
        {
          $set: {
            payoutStatus: 'paid',
            paidOutAt: new Date(),
            paidOutAmount: holdingAmount
          }
        }
      );
      
      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { error: "NFT purchase not found for update" },
          { status: 404, headers: corsHeaders() }
        );
      }

      // Deduct the payout amount from user's holding wallet balance
      const user = await User.findById(nftPurchase.userId).select('memberId holdingWalletBalance isActivated');
      if (user) {
        const currentHoldingBalance = user.holdingWalletBalance || 0;
        const newHoldingBalance = currentHoldingBalance - holdingAmount;
        
        console.log(`💰 Deducting $${holdingAmount} from user ${user.memberId}'s holding wallet`);
        console.log(`   Current: $${currentHoldingBalance} -> New: $${newHoldingBalance}`);

        const updateData = {
          $set: {
            holdingWalletBalance: newHoldingBalance
          }
        };

        // If holding balance becomes 0 or negative, schedule deactivation
        if (newHoldingBalance <= 0 && user.isActivated) {
          const deactivationTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
          updateData.$set.deactivationScheduledAt = deactivationTime;
          console.log(`⏰ Scheduling deactivation for user ${user.memberId} at ${deactivationTime.toISOString()}`);
        }

        await User.findByIdAndUpdate(nftPurchase.userId, updateData);
      }
    } catch (updateError) {
      console.error("Error updating NFT purchase:", updateError);
      return NextResponse.json(
        { error: "Error updating NFT purchase", details: updateError.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payout processed successfully (dummy payment)",
        payout: {
          userId: userId,
          nftCode: nftCode,
          amount: holdingAmount
        }
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("NFT payout API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST endpoint for batch payout
export async function PUT(request) {
  try {
    const headersList = await headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if user is admin (admin token has userId: "admin" or role: "admin")
    await dbConnect();
    // Admin token might have userId: "admin" (string) or a real userId
    if (decoded.userId === "admin" || decoded.role === "admin" || decoded.isAdmin) {
      // Admin token is valid, proceed
    } else {
      // Check if it's a real user with admin role
      const adminUser = await User.findById(decoded.userId);
      if (!adminUser || adminUser.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403, headers: corsHeaders() }
        );
      }
    }

    const body = await request.json();
    const { payouts } = body; // Array of {userId, nftCode}

    if (!Array.isArray(payouts) || payouts.length === 0) {
      return NextResponse.json(
        { error: "payouts array is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const results = [];
    const errors = [];

    for (const payout of payouts) {
      try {
        const { userId, nftCode } = payout;

        if (!userId || !nftCode) {
          errors.push({ payout, error: "userId and nftCode are required" });
          continue;
        }

        // Find the NFT purchase (mongoose will handle ObjectId conversion)
        let nftPurchase;
        try {
          nftPurchase = await NftPurchase.findOne({
            userId: userId,
            code: nftCode
          });
        } catch (err) {
          errors.push({ payout, error: `Error finding NFT: ${err.message}` });
          continue;
        }

        if (!nftPurchase) {
          errors.push({ payout, error: "NFT purchase not found" });
          continue;
        }

        // Check if already paid out (handle cases where payoutStatus might not exist)
        if (nftPurchase.payoutStatus && nftPurchase.payoutStatus === 'paid') {
          errors.push({ payout, error: "Already paid out" });
          continue;
        }

        // Calculate holding amount (dummy payment - just mark as paid)
        const holdingAmount = calculateHoldingAmount(nftCode);

        // Mark NFT as paid out (dummy payment - no actual money transfer)
        try {
          const updateResult = await NftPurchase.updateOne(
            { _id: nftPurchase._id },
            {
              $set: {
                payoutStatus: 'paid',
                paidOutAt: new Date(),
                paidOutAmount: holdingAmount
              }
            }
          );
          
          if (updateResult.matchedCount === 0) {
            errors.push({ payout, error: "NFT purchase not found for update" });
            continue;
          }
        } catch (updateError) {
          errors.push({ payout, error: `Error updating NFT: ${updateError.message}` });
          continue;
        }

        results.push({
          userId,
          nftCode,
          amount: holdingAmount,
          success: true
        });

      } catch (err) {
        errors.push({ payout, error: err.message });
      }
    }

    return NextResponse.json(
      {
        success: true,
        processed: results.length,
        failed: errors.length,
        results,
        errors
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Batch NFT payout API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

