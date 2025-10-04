import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// GET endpoint to fetch user's support tickets
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query = { userId: new mongoose.Types.ObjectId(decoded.userId) };
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get tickets with pagination
    const skip = (page - 1) * limit;
    const tickets = await SupportTicket.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-responses') // Exclude responses for list view
      .lean();

    const totalCount = await SupportTicket.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const pagination = {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: skip + 1,
      endIndex: Math.min(skip + limit, totalCount)
    };

    return NextResponse.json(
      { tickets, pagination },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Get user support tickets API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
