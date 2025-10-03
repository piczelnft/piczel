import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// Mock paid withdrawal data for demonstration - matches the user's example
const generateMockPaidWithdrawals = () => {
  return [
    {
      _id: "paid_1",
      requestId: "RQ1756852528",
      memberId: "TSL368130",
      memberName: "",
      gross: 5.00,
      charges: 0.50,
      net: 4.50,
      requestDate: new Date("2025-09-03T04:05:30"),
      paymentDate: new Date("2025-09-03T04:06:02"),
      status: "paid"
    },
    {
      _id: "paid_2",
      requestId: "RQ1756169225",
      memberId: "TSL368130",
      memberName: "",
      gross: 10.00,
      charges: 1.00,
      net: 9.00,
      requestDate: new Date("2025-08-26T06:17:06"),
      paymentDate: new Date("2025-08-26T06:18:04"),
      status: "paid"
    },
    {
      _id: "paid_3",
      requestId: "RQ1755956356",
      memberId: "TSL467727",
      memberName: "",
      gross: 100.00,
      charges: 10.00,
      net: 90.00,
      requestDate: new Date("2025-08-23T19:09:17"),
      paymentDate: new Date("2025-08-23T19:10:04"),
      status: "paid"
    },
    {
      _id: "paid_4",
      requestId: "RQ1755877586",
      memberId: "TSL467727",
      memberName: "",
      gross: 10.00,
      charges: 1.00,
      net: 9.00,
      requestDate: new Date("2025-08-22T21:16:29"),
      paymentDate: new Date("2025-08-22T21:17:04"),
      status: "paid"
    },
    {
      _id: "paid_5",
      requestId: "RQ1755877393",
      memberId: "TSL368130",
      memberName: "",
      gross: 10.00,
      charges: 1.00,
      net: 9.00,
      requestDate: new Date("2025-08-22T21:13:14"),
      paymentDate: new Date("2025-08-22T21:14:04"),
      status: "paid"
    },
    {
      _id: "paid_6",
      requestId: "RQ1755877321",
      memberId: "TSL161850",
      memberName: "",
      gross: 10.00,
      charges: 1.00,
      net: 9.00,
      requestDate: new Date("2025-08-22T21:12:05"),
      paymentDate: new Date("2025-08-22T21:13:04"),
      status: "paid"
    },
    {
      _id: "paid_7",
      requestId: "RQ1755855418",
      memberId: "TSL821942",
      memberName: "",
      gross: 5.00,
      charges: 0.50,
      net: 4.50,
      requestDate: new Date("2025-08-22T15:06:59"),
      paymentDate: new Date("2025-08-22T15:07:04"),
      status: "paid"
    },
    {
      _id: "paid_8",
      requestId: "RQ1755704399",
      memberId: "TSL967304",
      memberName: "",
      gross: 5.00,
      charges: 0.50,
      net: 4.50,
      requestDate: new Date("2025-08-20T21:10:01"),
      paymentDate: new Date("2025-08-20T21:10:06"),
      status: "paid"
    },
    {
      _id: "paid_9",
      requestId: "RQ1755704358",
      memberId: "TSL428350",
      memberName: "",
      gross: 119.00,
      charges: 11.90,
      net: 107.10,
      requestDate: new Date("2025-08-20T21:09:20"),
      paymentDate: new Date("2025-08-20T21:10:05"),
      status: "paid"
    },
    {
      _id: "paid_10",
      requestId: "RQ1755703011",
      memberId: "TSL675590",
      memberName: "",
      gross: 107.00,
      charges: 10.70,
      net: 96.30,
      requestDate: new Date("2025-08-20T20:46:54"),
      paymentDate: new Date("2025-08-20T20:47:04"),
      status: "paid"
    }
  ];
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
    const sortBy = searchParams.get('sortBy') || 'paymentDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Generate mock paid withdrawals
    let allPayments = generateMockPaidWithdrawals();

    // Apply filters
    if (search) {
      allPayments = allPayments.filter(payment => 
        payment.requestId.toLowerCase().includes(search.toLowerCase()) ||
        payment.memberId.toLowerCase().includes(search.toLowerCase()) ||
        payment.memberName.toLowerCase().includes(search.toLowerCase()) ||
        payment.gross.toString().includes(search)
      );
    }

    // Sort payments
    allPayments.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'paymentDate' || sortBy === 'requestDate') {
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
    const totalCount = allPayments.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const payments = allPayments.slice(skip, skip + limit);

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
      { payments, pagination },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Paid withdrawals API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
