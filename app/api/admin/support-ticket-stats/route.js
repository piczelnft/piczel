import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

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

    // Mock support ticket statistics
    // In a real application, these would be calculated from actual database queries
    const stats = {
      totalTickets: 127,
      openTickets: 23,
      inProgressTickets: 15,
      resolvedTickets: 67,
      closedTickets: 18,
      pendingTickets: 4,
      urgentTickets: 8,
      highPriorityTickets: 12,
      mediumPriorityTickets: 45,
      lowPriorityTickets: 62,
      
      // Category breakdown
      categoryStats: {
        technical: 45,
        account: 23,
        payment: 18,
        general: 28,
        bugReport: 8,
        featureRequest: 5
      },
      
      // Time-based statistics
      ticketsToday: 7,
      ticketsThisWeek: 23,
      ticketsThisMonth: 89,
      
      // Response time statistics
      averageResponseTime: "2.5 hours",
      averageResolutionTime: "1.2 days",
      
      // Agent performance
      activeAgents: 3,
      totalResponses: 234,
      
      // Recent activity
      recentActivity: [
        {
          type: "ticket_created",
          description: "New ticket created by user@example.com",
          timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        },
        {
          type: "ticket_resolved",
          description: "Ticket #TK123456 resolved by Admin",
          timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
        },
        {
          type: "ticket_assigned",
          description: "Ticket #TK123457 assigned to Support Agent",
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      ]
    };

    return NextResponse.json(
      { stats },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Support ticket stats API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
