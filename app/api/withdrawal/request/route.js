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
    const { amount, walletAddress, paymentMethod, notes } = requestBody;

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

    // Connect to database
    await dbConnect();

    // Get user information
    const user = await User.findById(decoded.userId).select('name email memberId wallet.balance walletBalance');
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get current balance (use wallet.balance as primary, fallback to walletBalance)
    const currentBalance = user.wallet?.balance || user.walletBalance || 0;

    // Check if user has sufficient balance
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check minimum withdrawal amount
    if (amount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $10" },
        { status: 400, headers: corsHeaders() }
      );
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
      walletAddress: walletAddress.trim(),
      notes: notes || "",
      status: 'pending',
      fees: 0, // No fees for now
      netAmount: parseFloat(amount)
    };

    // Save withdrawal to database
    const withdrawal = await Withdrawal.create(withdrawalData);

    // Update user balance (deduct the withdrawal amount)
    // Update both wallet.balance and walletBalance for consistency
    await User.findByIdAndUpdate(
      decoded.userId,
      { 
        $inc: { 
          'wallet.balance': -parseFloat(amount),
          'walletBalance': -parseFloat(amount)
        } 
      }
    );

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
