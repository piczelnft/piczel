import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

    // Verify admin credentials
    if (email === adminEmail && password === adminPassword) {
      // Generate JWT token for admin
      const token = jwt.sign(
        { 
          userId: "admin", 
          email: adminEmail, 
          role: "admin",
          isAdmin: true 
        },
        process.env.JWT_SECRET || "IamBatman0001",
        { expiresIn: "24h" }
      );

      // Return admin data and token
      return NextResponse.json(
        {
          message: "Admin login successful",
          admin: {
            id: "admin",
            email: adminEmail,
            role: "admin",
            name: "System Administrator"
          },
          token,
        },
        { 
          status: 200,
          headers: corsHeaders()
        }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}
