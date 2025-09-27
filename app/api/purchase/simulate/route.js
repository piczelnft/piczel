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

    const { usdAmount, bnbAmount, packages, bnbPrice } = await request.json();

    if (!usdAmount || !bnbAmount || !packages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Simulate purchase by updating user's wallet balance
    const currentBalance = user.wallet?.balance || 0;
    const newBalance = currentBalance + parseFloat(usdAmount);

    const updated = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "wallet.balance": newBalance,
          package: `${packages}x100USD`, // Update package info
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update balance" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Purchase simulated successfully",
        user: {
          memberId: updated.memberId,
          name: updated.name,
          wallet: {
            balance: updated.wallet?.balance || newBalance,
            address: updated.wallet?.address || "",
          },
          package: updated.package,
        },
        transaction: {
          usdAmount: parseFloat(usdAmount),
          bnbAmount: parseFloat(bnbAmount),
          bnbPrice: parseFloat(bnbPrice),
          packages: packages,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Simulate purchase error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
