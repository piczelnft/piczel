import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// Mock cancelled withdrawal data for demonstration
const generateMockCancelledRequests = (count = 15) => {
  const mockRequests = [];

  for (let i = 0; i < count; i++) {
    const grossAmount = Math.random() * 1000 + 50; // $50 - $1050
    const charges = grossAmount * 0.1; // 10% charges
    const netAmount = grossAmount - charges;
    const requestDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Last 14 days
    const cancelledDate = new Date(requestDate.getTime() + Math.random() * 24 * 60 * 60 * 1000); // 1 day later
    
    mockRequests.push({
      _id: `cancelled_${i + 1}`,
      requestId: `RQ${Date.now()}${Math.random().toString().substr(2, 7)}`,
      memberId: `TSL${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      memberName: `User ${i + 1}`,
      gross: parseFloat(grossAmount.toFixed(2)),
      charges: parseFloat(charges.toFixed(2)),
      net: parseFloat(netAmount.toFixed(2)),
      requestDate: requestDate,
      cancelledOn: cancelledDate,
      status: 'cancelled'
    });
  }

  return mockRequests;
};

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'cancelledOn';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Generate mock cancelled requests
    let allRequests = generateMockCancelledRequests(0); // Empty for demonstration

    // Apply filters
    if (search) {
      allRequests = allRequests.filter(request => 
        request.requestId.toLowerCase().includes(search.toLowerCase()) ||
        request.memberId.toLowerCase().includes(search.toLowerCase()) ||
        request.memberName.toLowerCase().includes(search.toLowerCase()) ||
        request.gross.toString().includes(search)
      );
    }

    // Sort requests
    allRequests.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'cancelledOn' || sortBy === 'requestDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = allRequests.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const requests = allRequests.slice(skip, skip + limit);

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
      { requests, pagination },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Cancelled withdrawals API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
