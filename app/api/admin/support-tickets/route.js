import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Generate mock support tickets
    let allTickets = generateMockSupportTickets();

    // Apply filters
    if (search) {
      allTickets = allTickets.filter(ticket => 
        ticket.ticketId.toLowerCase().includes(search.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.userName.toLowerCase().includes(search.toLowerCase()) ||
        ticket.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      allTickets = allTickets.filter(ticket => ticket.status === status);
    }

    if (priority !== 'all') {
      allTickets = allTickets.filter(ticket => ticket.priority === priority);
    }

    // Sort tickets
    allTickets.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = allTickets.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const tickets = allTickets.slice(skip, skip + limit);

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

    const { userId, subject, description, category, priority } = await request.json();

    // Validate input
    if (!userId || !subject || !description) {
      return NextResponse.json(
        { error: "User ID, subject, and description are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create ticket record (in real app, this would be saved to a SupportTicket collection)
    const ticket = {
      _id: `ticket_${Date.now()}`,
      ticketId: `TK${Date.now()}${Math.random().toString().substr(2, 4)}`,
      userId: userId,
      subject: subject,
      description: description,
      category: category || 'General',
      priority: priority || 'medium',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decoded.userId
    };

    // In a real application, you would save this to a SupportTicket collection
    // await SupportTicket.create(ticket);

    return NextResponse.json(
      { 
        message: "Support ticket created successfully",
        ticket: ticket
      },
      { status: 200, headers: corsHeaders() }
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
