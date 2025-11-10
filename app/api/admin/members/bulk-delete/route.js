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

// DELETE - Bulk delete members
export async function DELETE(request) {
  try {
    console.log("Bulk delete members API called");

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

      // Parse the request body
      const { memberIds } = await request.json();

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return NextResponse.json(
          { error: "No member IDs provided for deletion" },
          {
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      await dbConnect();

      // Delete multiple members in a single operation
      const result = await User.deleteMany({
        memberId: { $in: memberIds },
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: "No members found with the provided IDs" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `${result.deletedCount} member(s) deleted successfully`,
        },
        {
          status: 200,
          headers: corsHeaders(),
        }
      );
    } catch (error) {
      console.error("JWT verification error:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error) {
    console.error("Error in bulk delete members:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete members" },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
