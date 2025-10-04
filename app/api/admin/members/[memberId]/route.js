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

// DELETE - Delete a specific member
export async function DELETE(request, { params }) {
  try {
    console.log("Admin Delete Member API called");

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

      // Verify this is an admin token
      if (!decoded.isAdmin || decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          {
            status: 403,
            headers: corsHeaders(),
          }
        );
      }

      console.log("Admin delete member request verified");

      // Get memberId from params
      const { memberId } = params;

      if (!memberId) {
        return NextResponse.json(
          { error: "Member ID is required" },
          {
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Find the user to delete
      const userToDelete = await User.findOne({ memberId: memberId });

      if (!userToDelete) {
        return NextResponse.json(
          { error: "Member not found" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      // Check if user has any children (sponsored members)
      const childrenCount = await User.countDocuments({
        sponsor: userToDelete._id,
      });

      if (childrenCount > 0) {
        return NextResponse.json(
          {
            error:
              "Cannot delete member with active referrals. Please reassign or delete referrals first.",
          },
          {
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      // Delete the user
      await User.findByIdAndDelete(userToDelete._id);

      console.log(`Successfully deleted member: ${memberId}`);

      return NextResponse.json(
        {
          message: "Member deleted successfully",
          deletedMember: {
            memberId: userToDelete.memberId,
            name: userToDelete.name,
            email: userToDelete.email,
          },
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
    console.error("Admin Delete Member API error:", error);
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
