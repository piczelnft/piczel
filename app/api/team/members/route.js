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

export async function GET(request) {
  try {
    console.log("Team Members API called");
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
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

      // Get user data to find their direct team members
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

      console.log("Fetching team members for user:", user.memberId);

      // Build search query
      let searchQuery = { sponsor: userId };
      
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        searchQuery = {
          sponsor: userId,
          $or: [
            { memberId: searchRegex },
            { name: searchRegex },
            { email: searchRegex },
            { package: searchRegex }
          ]
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalMembers = await User.countDocuments(searchQuery);

      // Get team members with pagination and sorting
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const teamMembers = await User.find(searchQuery)
        .select("-password")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('sponsor', 'memberId name');

      // Transform data for frontend
      const transformedMembers = await Promise.all(
        teamMembers.map(async (member) => {
          // Calculate downline count for each member
          const downlineCount = await User.countDocuments({ sponsor: member._id });
          
          return {
            id: member._id,
            image: member.profile?.avatar || '',
            joiningDate: new Date(member.createdAt).toLocaleDateString('en-GB'),
            memberId: member.memberId,
            name: member.name,
            email: member.email,
            downline: downlineCount,
            package: member.package || '$0',
            sponsorId: member.sponsor?.memberId || 'N/A',
            status: member.isActivated ? 'Active' : 'Inactive'
          };
        })
      );

      // Calculate pagination info
      const totalPages = Math.ceil(totalMembers / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const responseData = {
        members: transformedMembers,
        pagination: {
          currentPage: page,
          totalPages,
          totalMembers,
          limit,
          hasNextPage,
          hasPrevPage,
          startIndex: skip + 1,
          endIndex: Math.min(skip + limit, totalMembers)
        },
        user: {
          memberId: user.memberId,
          name: user.name
        }
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
    console.error("Team Members API error:", error);
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
