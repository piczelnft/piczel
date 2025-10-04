import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import SupportTicket from "@/models/SupportTicket";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// POST endpoint to create a new support ticket (user action)
export async function POST(request) {
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

    const requestBody = await request.json();
    const { subject, message, category, priority } = requestBody;

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Connect to database
    await dbConnect();

    // Get user information
    const user = await User.findById(decoded.userId).select('name email memberId');
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Create ticket record
    const ticketData = {
      ticketId: `TK${Date.now()}${Math.random().toString().substr(2, 4)}`,
      userId: new mongoose.Types.ObjectId(decoded.userId),
      userName: user.name,
      userEmail: user.email,
      memberId: user.memberId,
      subject: subject,
      description: message,
      category: category || 'General',
      priority: priority || 'medium',
      status: 'open'
    };

    // Save ticket to database
    const ticket = await SupportTicket.create(ticketData);

    return NextResponse.json(
      { 
        message: "Support ticket created successfully",
        ticket: ticket
      },
      { status: 201, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Create support ticket API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
