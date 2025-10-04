import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// GET endpoint to fetch user information and admin details
export async function GET(request) {
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

    // Get admin information (you can modify this to get actual admin data)
    const admin = await User.findOne({ role: 'admin' }).select('name email memberId');
    
    const adminInfo = admin ? {
      name: admin.name,
      email: admin.email,
      memberId: admin.memberId
    } : {
      name: 'Admin',
      email: 'admin@dgtek.com',
      memberId: 'ADMIN001'
    };

    return NextResponse.json(
      { 
        user: {
          name: user.name,
          email: user.email,
          memberId: user.memberId
        },
        admin: adminInfo
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Get user info API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
