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

export async function POST(request) {
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
    } catch {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Only admins can reply from this endpoint
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    await dbConnect();

    const { ticketId, message } = await request.json();

    if (!ticketId || !message || !message.trim()) {
      return NextResponse.json(
        { error: "ticketId and message are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json(
        { error: `Invalid ticket ID format: ${ticketId}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Derive admin identity for response (schema requires senderId and senderName)
    const possibleIds = [decoded.userId, decoded.id, decoded._id, ticket.assignedTo].filter(Boolean);
    let validSenderId = possibleIds.find((v) => mongoose.Types.ObjectId.isValid(v?.toString?.() || v));
    // Fallback: use a constant placeholder ObjectId for system admin when token does not carry a Mongo ObjectId
    if (!validSenderId) validSenderId = '000000000000000000000000';
    const senderName = decoded.name || decoded.fullName || decoded.email || "Admin";

    // Append admin response
    ticket.responses.push({
      message: message.trim(),
      sender: "admin",
      senderId: new mongoose.Types.ObjectId(validSenderId),
      senderName,
      createdAt: new Date()
    });
    ticket.lastResponse = new Date();
    ticket.updatedAt = new Date();

    await ticket.save();

    return NextResponse.json(
      { message: "Reply added", ticketId: ticket._id, responsesCount: ticket.responses.length },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Reply to support ticket API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}


