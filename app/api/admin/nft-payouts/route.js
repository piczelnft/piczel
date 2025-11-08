import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

export async function GET(request) {
  try {
    const headersList = await headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if user is admin (admin token has userId: "admin" or role: "admin")
    await dbConnect();
    // Admin token might have userId: "admin" (string) or a real userId
    if (!(decoded.userId === "admin" || decoded.role === "admin" || decoded.isAdmin)) {
      // Check if it's a real user with admin role
      const adminUser = await User.findById(decoded.userId);
      if (!adminUser || adminUser.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403, headers: corsHeaders() }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";

    // Find all paid NFTs
    const query = { payoutStatus: 'paid' };

    // If search is provided, find users matching search and filter by their userIds
    if (search) {
      const users = await User.find({
        $or: [
          { memberId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      query.userId = { $in: users.map((u) => u._id) };
    }

    // Get all paid purchases first (we need all to group properly)
    const allPaidPurchases = await NftPurchase.find(query)
      .sort({ paidOutAt: -1 })
      .lean();

    // Get user information for each paid purchase
    const userIds = [...new Set(allPaidPurchases.map((p) => String(p.userId)))];
    const usersById = Object.fromEntries(
      (await User.find({ _id: { $in: userIds } })
        .select("_id memberId name email")
        .lean()).map((u) => [String(u._id), u])
    );

    // Group payouts by user and date (same user, same paidOutAt date = one payout record)
    const payoutMap = new Map();

    allPaidPurchases.forEach((purchase) => {
      const user = usersById[String(purchase.userId)];
      if (!user) return;

      const paidOutDate = purchase.paidOutAt
        ? new Date(purchase.paidOutAt).toISOString().split("T")[0]
        : "unknown";
      const key = `${purchase.userId}_${paidOutDate}`;

      if (!payoutMap.has(key)) {
        payoutMap.set(key, {
          _id: `payout-${purchase.userId}-${paidOutDate}`,
          userId: String(purchase.userId),
          userName: user.name || "Unknown User",
          userEmail: user.email || "No email",
          memberId: user.memberId || "N/A",
          nftCodes: [],
          nftCount: 0,
          amount: 0,
          status: "completed",
          processedAt: purchase.paidOutAt || purchase.updatedAt,
          processedBy: "admin",
        });
      }

      const payout = payoutMap.get(key);
      payout.nftCodes.push(purchase.code);
      payout.nftCount += 1;
      payout.amount += purchase.paidOutAmount || 0;
    });

    // Convert to array and sort by processedAt (most recent first)
    const allPayouts = Array.from(payoutMap.values()).sort((a, b) => {
      return new Date(b.processedAt) - new Date(a.processedAt);
    });

    // Apply pagination to grouped payouts
    const skip = (page - 1) * limit;
    const paginatedPayouts = allPayouts.slice(skip, skip + limit);
    const total = allPayouts.length;

    return NextResponse.json(
      {
        payouts: paginatedPayouts,
        pagination: {
          total: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("NFT payouts API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

