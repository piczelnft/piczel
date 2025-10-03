import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

export async function POST(request) {
  try {
    // Handle CORS preflight
    const headersList = headers();
    
    // Verify admin authentication
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

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    await dbConnect();

    const { memberId, walletAddress, amount } = await request.json();

    // Validate input
    if (!memberId || !walletAddress || !amount) {
      return NextResponse.json(
        { error: "Member ID, wallet address, and amount are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Find user by member ID
    const user = await User.findOne({ memberId: memberId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found with the provided Member ID" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Verify wallet address matches (optional validation)
    if (user.metamaskWallet?.address && user.metamaskWallet.address.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Provided wallet address does not match the user's connected wallet" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Update user's wallet balance
    const currentBalance = user.wallet?.balance || 0;
    const newBalance = currentBalance + numericAmount;

    // Update wallet balance and total deposit
    user.wallet = {
      ...user.wallet,
      balance: newBalance
    };
    
    // Update total deposit
    user.totalDeposit = (user.totalDeposit || 0) + numericAmount;

    // Save the user
    await user.save();

    // Create transaction record (you might want to create a separate Transaction model)
    const transaction = {
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      userId: user._id,
      memberId: user.memberId,
      type: 'Admin Add Funds',
      amount: numericAmount,
      walletAddress: walletAddress,
      status: 'Completed',
      adminId: decoded.userId,
      createdAt: new Date()
    };

    return NextResponse.json(
      { 
        message: "Funds added successfully",
        transaction: transaction,
        user: {
          memberId: user.memberId,
          name: user.name,
          email: user.email,
          previousBalance: currentBalance,
          newBalance: newBalance,
          amountAdded: numericAmount
        }
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Add funds API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// GET endpoint to fetch recent fund additions (optional)
export async function GET(request) {
  try {
    // Handle CORS preflight
    const headersList = headers();
    
    // Verify admin authentication
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

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Fetch users with recent activity (you might want to implement a proper transaction log)
    const users = await User.find({})
      .select('memberId name email wallet totalDeposit updatedAt')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    const recentFundAdditions = users.map(user => ({
      memberId: user.memberId,
      name: user.name,
      email: user.email,
      currentBalance: user.wallet?.balance || 0,
      totalDeposit: user.totalDeposit || 0,
      lastUpdated: user.updatedAt
    }));

    return NextResponse.json(
      { recentFundAdditions },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Get fund additions API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
