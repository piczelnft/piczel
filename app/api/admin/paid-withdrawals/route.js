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

// GET endpoint to fetch paid withdrawal requests for admin
export async function GET(request) {
  try {
    const headersList = await headers();
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

    // Check if user is admin (you might want to add admin role check here)
    // For now, we'll assume the token is from an admin user

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const dateFilter = searchParams.get('dateFilter') || 'all';
    const sortBy = searchParams.get('sortBy') || 'processedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query - only fetch completed withdrawals
    const query = {
      status: 'completed'
    };
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.processedAt = { $gte: startDate };
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { withdrawalId: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch completed withdrawals
    const withdrawals = await Withdrawal.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count
    const totalCount = await Withdrawal.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Format data to match frontend expectations
    const payments = withdrawals.map(withdrawal => ({
      requestId: withdrawal.withdrawalId,
      requestDate: withdrawal.createdAt,
      memberId: withdrawal.memberId,
      memberName: withdrawal.userName,
      userEmail: withdrawal.userEmail,
      walletAddress: withdrawal.walletAddress,
      gross: withdrawal.amount,
      charges: withdrawal.fees || 0,
      net: withdrawal.netAmount || (withdrawal.amount - (withdrawal.fees || 0)),
      paymentDate: withdrawal.processedAt || withdrawal.updatedAt,
      status: withdrawal.status,
      transactionHash: withdrawal.transactionHash,
      processedBy: withdrawal.processedBy,
      adminNotes: withdrawal.adminNotes
    }));

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
      { 
        payments,
        pagination
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Admin paid withdrawals API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}