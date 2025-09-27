import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { corsHeaders } from "@/lib/cors";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

export async function GET() {
  try {
    console.log("Test User API called");
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization header" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      console.log("Connecting to database...");
      await dbConnect();
      console.log("Database connected successfully");

      // Get user data
      const user = await User.findById(userId).select("-password");
      
      if (!user) {
        return NextResponse.json(
          { 
            error: "User not found",
            userId: userId,
            decoded: decoded
          }, 
          { 
            status: 404,
            headers: corsHeaders()
          }
        );
      }

      // Get basic statistics
      const directTeam = await User.countDocuments({ sponsor: userId });
      const totalUsers = await User.countDocuments();

      return NextResponse.json({
        message: "User data retrieved successfully",
        user: {
          id: user._id,
          memberId: user.memberId,
          name: user.name,
          email: user.email,
          isActivated: user.isActivated,
          wallet: user.wallet,
          package: user.package,
          createdAt: user.createdAt
        },
        stats: {
          directTeam: directTeam,
          totalUsers: totalUsers
        }
      });

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { 
          error: "Invalid token", 
          details: jwtError.message 
        }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

  } catch (error) {
    console.error("Test User API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message,
        stack: error.stack 
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}
