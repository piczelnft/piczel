import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// POST endpoint to create a new withdrawal request
export async function POST(request) {
  try {
    // Handle CORS preflight
    const headersList = await headers();
    
    // Verify user authentication
    const authorization = headersList.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const requestBody = await request.json();
    const { amount, walletAddress, paymentMethod, withdrawalType, notes } = requestBody;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!walletAddress || walletAddress.trim().length < 10) {
      return NextResponse.json(
        { error: "Valid wallet address is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!paymentMethod || !['crypto', 'bank', 'paypal'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Valid payment method is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!withdrawalType || !['spot', 'level'].includes(withdrawalType)) {
      return NextResponse.json(
        { error: "Valid withdrawal type is required (spot or level)" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Connect to database
    await dbConnect();

    // Get user information (include incomes for withdrawal balance)
    const user = await User.findById(decoded.userId).select('name email memberId wallet.balance walletBalance sponsorIncome levelIncome rewardIncome');
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Compute balances
    const currentBalance = user.wallet?.balance || user.walletBalance || 0;
    const sponsorIncome = user.sponsorIncome || 0;
    const levelIncome = user.levelIncome || 0;
    const rewardIncome = user.rewardIncome || 0;
    const withdrawalBalance = sponsorIncome + levelIncome + rewardIncome; // All incomes withdrawable

    // Check minimum withdrawal amount ($5)
    if (amount < 5) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $5" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if user has sufficient balance for the specific withdrawal type
    const availableBalance = withdrawalType === 'spot' ? rewardIncome : levelIncome;
    if (availableBalance < amount) {
      const incomeType = withdrawalType === 'spot' ? 'spot income' : 'level income';
      return NextResponse.json(
        { error: `Insufficient ${incomeType} balance` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Enforce one withdrawal request per 24 hours
    const lastWithdrawal = await Withdrawal.findOne({ userId: decoded.userId }).sort({ createdAt: -1 });
    if (lastWithdrawal) {
      const hoursSinceLast = (Date.now() - new Date(lastWithdrawal.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        const remaining = Math.ceil(24 - hoursSinceLast);
        return NextResponse.json(
          { error: `Only one withdrawal request allowed every 24 hours. Try again in ${remaining} hour(s).` },
          { status: 429, headers: corsHeaders() }
        );
      }
    }

    // Create withdrawal record
    const withdrawalData = {
      withdrawalId: `WD${Date.now()}${Math.random().toString().substr(2, 4)}`,
      userId: new mongoose.Types.ObjectId(decoded.userId),
      userName: user.name,
      userEmail: user.email,
      memberId: user.memberId,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod,
      withdrawalType: withdrawalType,
      walletAddress: walletAddress.trim(),
      notes: notes || "",
      status: 'pending',
      fees: 0, // No fees for now
      netAmount: parseFloat(amount)
    };

    // Save withdrawal to database
    const withdrawal = await Withdrawal.create(withdrawalData);

    // Update user balances based on withdrawal type
    const deductionAmount = parseFloat(amount);
    const updateFields = {
      $inc: { 
        'wallet.balance': -deductionAmount,
        'walletBalance': -deductionAmount
      }
    };
    
    // Deduct from the specific income type
    if (withdrawalType === 'spot') {
      updateFields.$inc.rewardIncome = -deductionAmount;
    } else {
      updateFields.$inc.levelIncome = -deductionAmount;
    }
    
    await User.findByIdAndUpdate(decoded.userId, updateFields);

    return NextResponse.json(
      { 
        message: "Withdrawal request created successfully",
        withdrawal: withdrawal
      },
      { status: 201, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Create withdrawal request API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
