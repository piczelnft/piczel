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

// Mock support ticket data for demonstration
const generateMockSupportTickets = (count = 30) => {
  const mockTickets = [];
  const categories = ['Technical', 'Account', 'Payment', 'General', 'Bug Report', 'Feature Request'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['open', 'in_progress', 'resolved', 'closed', 'pending'];
  const subjects = [
    'Login issues with my account',
    'Payment not processing',
    'Unable to withdraw funds',
    'Mobile app crashes frequently',
    'Account verification problem',
    'Missing transaction history',
    'Two-factor authentication not working',
    'Wallet connection issues',
    'Password reset not working',
    'Dashboard loading slowly'
  ];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    mockTickets.push({
      _id: `ticket_${i + 1}`,
      ticketId: `TK${Date.now()}${Math.random().toString().substr(2, 4)}`,
      userName: `User ${i + 1}`,
      userEmail: `user${i + 1}@example.com`,
      subject: subject,
      description: `This is a detailed description of the issue reported by the user. ${subject.toLowerCase()} has been causing problems for the user and they need assistance to resolve it.`,
      category: category,
      priority: priority,
      status: status,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      updatedAt: new Date(),
      assignedTo: status === 'in_progress' ? 'Admin User' : null,
      lastResponse: status === 'resolved' || status === 'closed' ? new Date() : null
    });
  }

  return mockTickets;
};

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query = {};
    
    // Apply status filter
    if (status !== 'all') {
      query.status = status;
    }
    
    // Apply priority filter
    if (priority !== 'all') {
      query.priority = priority;
    }
    
    // Apply search filter
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch tickets with pagination
    const tickets = await SupportTicket.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const totalCount = await SupportTicket.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

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
      { tickets, pagination },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Admin support tickets API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST endpoint to create a new support ticket (admin action)
export async function POST(request) {
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

    const { userId, subject, description, category, priority } = await request.json();

    // Validate input
    if (!userId || !subject || !description) {
      return NextResponse.json(
        { error: "User ID, subject, and description are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create ticket record
    const ticketData = {
      userId: new mongoose.Types.ObjectId(userId),
      subject: subject,
      description: description,
      category: category || 'General',
      priority: priority || 'medium',
      status: 'open',
      createdBy: new mongoose.Types.ObjectId(decoded.userId)
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
