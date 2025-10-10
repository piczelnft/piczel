import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// GET endpoint to fetch user's wallet balance
export async function GET(request) {
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

    // Connect to database
    await dbConnect();

    // Get user balance
    const user = await User.findById(decoded.userId).select('wallet.balance walletBalance sponsorIncome levelIncome name email');
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Use wallet.balance as the primary balance, fallback to walletBalance
    const balance = user.wallet?.balance || user.walletBalance || 0;
    const sponsorIncome = user.sponsorIncome || 0;
    const levelIncome = user.levelIncome || 0;
    // Withdrawal balance = direct sponsor commission only
    const withdrawalBalance = sponsorIncome;

    return NextResponse.json(
      { 
        balance: balance,
        withdrawalBalance: Number(withdrawalBalance.toFixed(2)),
        sponsorIncome: Number(sponsorIncome.toFixed(2)),
        levelIncome: Number(levelIncome.toFixed(2)),
        user: {
          name: user.name,
          email: user.email
        }
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Get wallet balance API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
