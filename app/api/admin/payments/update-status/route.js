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

export async function PUT(request) {
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

    const { paymentId, status, notes } = await request.json();

    // Validate input
    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Payment ID and status are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate status
    const validStatuses = ['completed', 'pending', 'failed', 'processing', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(', ') },
        { status: 400, headers: corsHeaders() }
      );
    }

    // In a real application, you would update the payment status in the Payment collection
    // For now, we'll simulate the update
    const updatedPayment = {
      _id: paymentId,
      status: status,
      updatedAt: new Date(),
      updatedBy: decoded.userId,
      adminNotes: notes || ''
    };

    // If payment is completed, you might want to update user's wallet balance
    if (status === 'completed') {
      // This would typically involve:
      // 1. Finding the payment record
      // 2. Getting the associated user
      // 3. Updating their wallet balance
      // 4. Recording the transaction
      
      // For demonstration, we'll just return success
      console.log(`Payment ${paymentId} completed - would update user wallet`);
    }

    // Log the status change
    console.log(`Payment ${paymentId} status changed to ${status} by admin ${decoded.userId}`);

    return NextResponse.json(
      { 
        message: "Payment status updated successfully",
        payment: updatedPayment
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Update payment status API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
