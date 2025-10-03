import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// Mock payment statistics for demonstration
const generateMockStats = () => {
  const totalPayments = Math.floor(Math.random() * 500) + 100; // 100-600 payments
  const completedPayments = Math.floor(totalPayments * 0.7); // 70% completed
  const pendingPayments = Math.floor(totalPayments * 0.15); // 15% pending
  const failedPayments = Math.floor(totalPayments * 0.1); // 10% failed
  const processingPayments = Math.floor(totalPayments * 0.05); // 5% processing
  
  const totalAmount = Math.random() * 1000000 + 500000; // $500k - $1.5M

  return {
    totalPayments,
    completedPayments,
    pendingPayments,
    failedPayments,
    processingPayments,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    averageAmount: parseFloat((totalAmount / totalPayments).toFixed(2)),
    successRate: parseFloat(((completedPayments / totalPayments) * 100).toFixed(1))
  };
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

    // Generate mock statistics (in real app, this would be calculated from Payment collection)
    const stats = generateMockStats();

    return NextResponse.json(
      { stats },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Payment stats API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
