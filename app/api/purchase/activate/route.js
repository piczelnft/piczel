import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getAuthUserId(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionHash, package: pkg } = await request.json();

    const buyer = await User.findById(userId);
    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Note: In the new system, users are activated at signup
    // This route can be used for package upgrades or purchases
    const updated = await User.findOneAndUpdate(
      { _id: buyer._id },
      {
        $set: {
          ...(pkg ? { package: pkg } : {}),
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Purchase update failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Purchase successful",
        user: {
          memberId: updated.memberId,
          isActivated: updated.isActivated,
          package: updated.package || "",
          transactionHash: transactionHash,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
