import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import Withdrawal from "@/models/Withdrawal";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// GET endpoint to fetch user's withdrawal history
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || 'all';

    // Connect to database
    await dbConnect();

    // Build query
    const query = { userId: new mongoose.Types.ObjectId(decoded.userId) };
    
    if (status !== 'all') {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch withdrawals with pagination
    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const totalCount = await Withdrawal.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      { 
        withdrawals: withdrawals,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalCount: totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Get withdrawal history API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
