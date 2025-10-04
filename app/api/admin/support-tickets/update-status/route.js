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

export async function PUT(request) {
  try {
    // Handle CORS preflight
    const headersList = await headers();
    
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

    // Connect to database
    await dbConnect();

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

    // Find the ticket by ID
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Update the ticket status
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      {
        status: status,
        assignedTo: assignedTo || decoded.userId,
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId(decoded.userId),
        $push: {
          statusHistory: {
            status: status,
            changedAt: new Date(),
            changedBy: new mongoose.Types.ObjectId(decoded.userId),
            notes: notes || null
          }
        }
      },
      { new: true }
    );

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
