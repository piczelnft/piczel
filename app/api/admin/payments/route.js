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

// Mock payment data for demonstration
const generateMockPayments = (count = 50) => {
  const paymentMethods = ['crypto', 'card', 'bank_transfer'];
  const statuses = ['completed', 'pending', 'failed', 'processing', 'cancelled'];
  const mockPayments = [];

  for (let i = 0; i < count; i++) {
    const amount = Math.random() * 10000 + 100; // $100 - $10,100
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    mockPayments.push({
      _id: `payment_${i + 1}`,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      memberId: `MMG${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      memberName: `User ${i + 1}`,
      memberEmail: `user${i + 1}@example.com`,
      amount: parseFloat(amount.toFixed(2)),
      paymentMethod: paymentMethod,
      status: status,
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      updatedAt: new Date()
    });
  }

  return mockPayments;
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

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Generate mock payments (in real app, this would come from a Payment collection)
    let allPayments = generateMockPayments(100);

    // Apply filters
    if (search) {
      allPayments = allPayments.filter(payment => 
        payment.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        payment.memberId.toLowerCase().includes(search.toLowerCase()) ||
        payment.memberName.toLowerCase().includes(search.toLowerCase()) ||
        payment.amount.toString().includes(search)
      );
    }

    if (status !== 'all') {
      allPayments = allPayments.filter(payment => payment.status === status);
    }

    // Sort payments
    allPayments.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
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
    console.error("Admin payments API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST endpoint to create a new payment (admin action)
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

    const { memberId, amount, paymentMethod, description } = await request.json();

    // Validate input
    if (!memberId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Member ID, amount, and payment method are required" },
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

    // Create payment record (in real app, this would be saved to a Payment collection)
    const payment = {
      _id: `payment_${Date.now()}`,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      memberId: user.memberId,
      memberName: user.name,
      memberEmail: user.email,
      amount: numericAmount,
      paymentMethod: paymentMethod,
      status: 'pending',
      walletAddress: user.metamaskWallet?.address || '',
      description: description || 'Admin created payment',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decoded.userId
    };

    // In a real application, you would save this to a Payment collection
    // await Payment.create(payment);

    return NextResponse.json(
      { 
        message: "Payment created successfully",
        payment: payment
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Create payment API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
