import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import NftPurchase from "@/models/NftPurchase";
import User from "@/models/User";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

export async function GET(request) {
  try {
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const series = searchParams.get("series") || "";

    const query = {};
    if (series) {
      query.series = series;
    }
    if (search) {
      // Find users by memberId, email or name then filter purchases by those users
      const users = await User.find({
        $or: [
          { memberId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      query.userId = { $in: users.map((u) => u._id) };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      NftPurchase.find(query)
        .sort({ purchasedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NftPurchase.countDocuments(query),
    ]);

    // Hydrate user fields
    const userIds = [...new Set(items.map((i) => String(i.userId)))];
    const usersById = Object.fromEntries(
      (await User.find({ _id: { $in: userIds } })
        .select("_id memberId name email")
        .lean()).map((u) => [String(u._id), u])
    );

    const results = items.map((i) => ({
      ...i,
      user: usersById[String(i.userId)] || null,
    }));

    return NextResponse.json(
      {
        items: results,
        page,
        limit,
        total,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}


