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

// GET - Fetch user profile data
export async function GET() {
  try {
    console.log("Profile GET API called");
    
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

      console.log("Fetching profile for user:", user.memberId);

      // Format profile data
      const profileData = {
        id: user._id,
        fullName: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        country: user.profile?.country || '',
        memberId: user.memberId || '',
        profileImage: user.profile?.avatar || null,
        isActivated: user.isActivated,
        package: user.package || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return NextResponse.json(
        { profile: profileData },
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
    console.error("Profile GET API error:", error);
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

// PUT - Update user profile data
export async function PUT(request) {
  try {
    console.log("Profile PUT API called");
    
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

      // Get request body
      const body = await request.json();
      const { fullName, email, mobile, country, profileImage } = body;

      console.log("Updating profile for user:", user.memberId);

      // Update user data
      const updateData = {
        name: fullName || user.name,
        email: email || user.email,
        mobile: mobile || user.mobile || '',
        'profile.country': country || user.profile?.country || '',
        ...(profileImage && { 'profile.avatar': profileImage })
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Failed to update profile" }, 
          { 
            status: 500,
            headers: corsHeaders()
          }
        );
      }

      // Format updated profile data
      const profileData = {
        id: updatedUser._id,
        fullName: updatedUser.name || '',
        email: updatedUser.email || '',
        mobile: updatedUser.mobile || '',
        country: updatedUser.profile?.country || '',
        memberId: updatedUser.memberId || '',
        profileImage: updatedUser.profile?.avatar || null,
        isActivated: updatedUser.isActivated,
        package: updatedUser.package || '',
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      return NextResponse.json(
        { 
          message: "Profile updated successfully",
          profile: profileData 
        },
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
    console.error("Profile PUT API error:", error);
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
