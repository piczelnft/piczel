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

    const { ticketId, status, assignedTo, notes } = await request.json();

    // Validate input
    if (!ticketId || !status) {
      return NextResponse.json(
        { error: "Ticket ID and status are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'pending'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(', ') },
        { status: 400, headers: corsHeaders() }
      );
    }

    // In a real application, you would:
    // 1. Find the ticket by ID
    // 2. Update the status and other fields
    // 3. Log the status change
    // 4. Send notifications if needed

    // Mock response for demonstration
    const updatedTicket = {
      _id: ticketId,
      status: status,
      assignedTo: assignedTo || decoded.userId,
      updatedAt: new Date(),
      updatedBy: decoded.userId,
      statusHistory: [
        {
          status: status,
          changedAt: new Date(),
          changedBy: decoded.userId,
          notes: notes || null
        }
      ]
    };

    // In a real application, you would save this to the database
    // await SupportTicket.findByIdAndUpdate(ticketId, {
    //   status: status,
    //   assignedTo: assignedTo,
    //   updatedAt: new Date(),
    //   $push: {
    //     statusHistory: {
    //       status: status,
    //       changedAt: new Date(),
    //       changedBy: decoded.userId,
    //       notes: notes
    //     }
    //   }
    // });

    return NextResponse.json(
      { 
        message: "Ticket status updated successfully",
        ticket: updatedTicket
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Update ticket status API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
