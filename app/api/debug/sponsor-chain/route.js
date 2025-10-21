import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// GET - Check sponsor chain for a user
export async function GET(request) {
  try {
    console.log("Debug Sponsor Chain API called");

    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("User token verified");

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Get user
      const user = await User.findById(decoded.userId).select('memberId name sponsor');
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      console.log(`Checking sponsor chain for user: ${user.memberId}`);

      // Build sponsor chain
      const sponsorChain = [];
      let currentUser = user;
      
      for (let level = 1; level <= 10; level++) {
        if (!currentUser.sponsor) {
          console.log(`No sponsor at level ${level}`);
          break;
        }

        const sponsor = await User.findById(currentUser.sponsor).select('memberId name sponsor');
        if (!sponsor) {
          console.log(`Sponsor not found at level ${level}`);
          break;
        }

        sponsorChain.push({
          level,
          memberId: sponsor.memberId,
          name: sponsor.name,
          sponsorId: sponsor.sponsor
        });

        console.log(`Level ${level}: ${sponsor.memberId} (${sponsor.name})`);
        currentUser = sponsor;
      }

      return NextResponse.json(
        {
          user: {
            memberId: user.memberId,
            name: user.name,
            sponsorId: user.sponsor
          },
          sponsorChain,
          totalLevels: sponsorChain.length
        },
        {
          status: 200,
          headers: corsHeaders(),
        }
      );

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error) {
    console.error("Debug Sponsor Chain API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
