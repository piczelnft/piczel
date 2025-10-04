import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

export async function GET(request) {
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

    // Calculate real support ticket statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all tickets for statistics
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      pendingTickets,
      urgentTickets,
      highPriorityTickets,
      mediumPriorityTickets,
      lowPriorityTickets,
      ticketsToday,
      ticketsThisWeek,
      ticketsThisMonth,
      categoryStats
    ] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'in_progress' }),
      SupportTicket.countDocuments({ status: 'resolved' }),
      SupportTicket.countDocuments({ status: 'closed' }),
      SupportTicket.countDocuments({ status: 'pending' }),
      SupportTicket.countDocuments({ priority: 'urgent' }),
      SupportTicket.countDocuments({ priority: 'high' }),
      SupportTicket.countDocuments({ priority: 'medium' }),
      SupportTicket.countDocuments({ priority: 'low' }),
      SupportTicket.countDocuments({ createdAt: { $gte: today } }),
      SupportTicket.countDocuments({ createdAt: { $gte: thisWeek } }),
      SupportTicket.countDocuments({ createdAt: { $gte: thisMonth } }),
      SupportTicket.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format category stats
    const formattedCategoryStats = {};
    categoryStats.forEach(cat => {
      formattedCategoryStats[cat._id?.toLowerCase() || 'general'] = cat.count;
    });

    // Get recent activity (last 10 tickets)
    const recentTickets = await SupportTicket.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('ticketId subject userName userEmail status createdAt');

    const recentActivity = recentTickets.map(ticket => ({
      type: "ticket_created",
      description: `New ticket created by ${ticket.userEmail}`,
      ticketId: ticket.ticketId,
      status: ticket.status,
      timestamp: ticket.createdAt
    }));

    const stats = {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      pendingTickets,
      urgentTickets,
      highPriorityTickets,
      mediumPriorityTickets,
      lowPriorityTickets,
      
      // Category breakdown
      categoryStats: formattedCategoryStats,
      
      // Time-based statistics
      ticketsToday,
      ticketsThisWeek,
      ticketsThisMonth,
      
      // Response time statistics (mock for now)
      averageResponseTime: "2.5 hours",
      averageResolutionTime: "1.2 days",
      
      // Agent performance (mock for now)
      activeAgents: 3,
      totalResponses: totalTickets,
      
      // Recent activity
      recentActivity
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
