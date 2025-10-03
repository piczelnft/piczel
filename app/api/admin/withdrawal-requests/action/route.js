import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
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

    const { requestId, action, notes } = await request.json();

    // Validate input
    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate action
    const validActions = ['approve', 'reject', 'process'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of: " + validActions.join(', ') },
        { status: 400, headers: corsHeaders() }
      );
    }

    // In a real application, you would update the withdrawal request status in the database
    // For now, we'll simulate the update
    const updatedRequest = {
      requestId: requestId,
      action: action,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'processing',
      updatedAt: new Date(),
      updatedBy: decoded.userId,
      adminNotes: notes || ''
    };

    // Log the action
    console.log(`Withdrawal request ${requestId} ${action}ed by admin ${decoded.userId}`);

    // If approved, you might want to:
    // 1. Update user's wallet balance (subtract the amount)
    // 2. Create a transaction record
    // 3. Send notification to user
    if (action === 'approve') {
      console.log(`Withdrawal request ${requestId} approved - would process payment`);
      // Process payment logic would go here
    } else if (action === 'reject') {
      console.log(`Withdrawal request ${requestId} rejected - would notify user`);
      // Rejection notification logic would go here
    }

    return NextResponse.json(
      { 
        message: `Withdrawal request ${action}ed successfully`,
        request: updatedRequest
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Withdrawal request action API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
