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

// GET - Fetch members with pagination and search
export async function GET(request) {
  try {
    console.log("Admin Members API called");

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

      console.log("Admin members request verified");

      // Get query parameters
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page")) || 1;
      const limit = parseInt(searchParams.get("limit")) || 10;
      const search = searchParams.get("search") || "";
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = searchParams.get("sortOrder") || "desc";

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Build search query
      let searchQuery = {};
      if (search) {
        searchQuery = {
          $or: [
            { memberId: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } },
          ],
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Fetch members with pagination
      const [members, totalCount] = await Promise.all([
        User.find(searchQuery)
          .select(
            "memberId name email mobile sponsor wallet metamaskWallet fundBalance isActivated isBlocked createdAt package note"
          )
          .populate("sponsor", "memberId name")
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(searchQuery),
      ]);

      // Format member data
      const formattedMembers = members.map((member, index) => ({
        sNo: skip + index + 1,
        joining:
          new Date(member.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) +
          "\n" +
          new Date(member.createdAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        avatar: member.profile?.avatar || "",
        memberId: member.memberId || "N/A",
        memberName: member.name || "N/A",
        sponsorId: member.sponsor?.memberId || "N/A",
        note: member.note || "",
        sponsorName: member.sponsor?.name || "N/A",
        walletBalance: member.wallet?.balance || 0,
        metamaskAddress: member.metamaskWallet?.address || "Not Connected",
        metamaskConnected: member.metamaskWallet?.isConnected || false,
        status: member.isBlocked
          ? "Blocked"
          : member.isActivated
          ? "Active"
          : "Inactive",
        action: "Edit/Delete",
      }));

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        members: formattedMembers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
          startIndex: skip + 1,
          endIndex: Math.min(skip + limit, totalCount),
        },
      };

      console.log(
        `Fetched ${formattedMembers.length} members, total: ${totalCount}`
      );

      return NextResponse.json(response, {
        status: 200,
        headers: corsHeaders(),
      });
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
    console.error("Admin Members API error:", error);
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
