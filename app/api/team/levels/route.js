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

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// Helper function to get all descendant user IDs recursively with depth limit
async function getDescendantIds(userId, depth = 0, maxDepth = 10) {
  if (depth >= maxDepth) {
    console.warn(`Max depth reached for user ${userId}`);
    return [];
  }
  
  try {
    const descendants = [];
    const directChildren = await User.find({ sponsor: userId }).select("_id").limit(1000);
    
    for (const child of directChildren) {
      descendants.push({ id: child._id, level: depth + 1 });
      const grandChildren = await getDescendantIds(child._id, depth + 1, maxDepth);
      descendants.push(...grandChildren);
    }
    
    return descendants;
  } catch (error) {
    console.error(`Error getting descendants for user ${userId}:`, error);
    return [];
  }
}

export async function GET(request) {
  try {
    console.log("Team Levels API called");
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
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
          { error: "User not found" }, 
          { 
            status: 404,
            headers: corsHeaders()
          }
        );
      }

      console.log("Fetching team levels for user:", user.memberId);

      // Get all descendants with their levels
      const allDescendants = await getDescendantIds(userId);
      
      // Count members by level (1-10)
      const levelCounts = {};
      for (let i = 1; i <= 10; i++) {
        levelCounts[i] = allDescendants.filter(desc => desc.level === i).length;
      }

      // Create levels data
      const levelsData = [];
      for (let i = 1; i <= 10; i++) {
        const levelName = i === 1 ? '1st Level' : 
                         i === 2 ? '2nd Level' : 
                         i === 3 ? '3rd Level' : 
                         `${i}th Level`;
        
        levelsData.push({
          id: i,
          levelNo: levelName,
          levelNumber: i,
          totalMembers: levelCounts[i] || 0
        });
      }

      // Calculate statistics
      const totalMembers = allDescendants.length;
      const activeLevels = Object.values(levelCounts).filter(count => count > 0).length;

      // If specific level is requested, get detailed members for that level
      let levelDetails = null;
      if (level) {
        const levelNum = parseInt(level);
        if (levelNum >= 1 && levelNum <= 10) {
          const levelMemberIds = allDescendants
            .filter(desc => desc.level === levelNum)
            .map(desc => desc.id);

          const levelMembers = await User.find({ 
            _id: { $in: levelMemberIds } 
          }).select("-password").limit(50);

          levelDetails = {
            level: levelNum,
            levelName: levelsData[levelNum - 1].levelNo,
            members: levelMembers.map(member => ({
              id: member._id,
              memberId: member.memberId,
              name: member.name,
              email: member.email,
              package: member.package || '$0',
              status: member.isActivated ? 'Active' : 'Inactive',
              joinedDate: new Date(member.createdAt).toLocaleDateString('en-GB')
            })),
            totalCount: levelMemberIds.length
          };
        }
      }

      const responseData = {
        levels: levelsData,
        statistics: {
          totalLevels: 10,
          totalMembers,
          activeLevels
        },
        user: {
          memberId: user.memberId,
          name: user.name
        },
        ...(levelDetails && { levelDetails })
      };

      return NextResponse.json(
        responseData,
        { 
          status: 200,
          headers: corsHeaders()
        }
      );

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

  } catch (error) {
    console.error("Team Levels API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}
