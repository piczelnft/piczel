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

async function findPlacementSlot(rootParentId) {
  // BFS to find first available L/R slot under rootParentId
  const queue = [rootParentId];
  const visited = new Set();
  let iterations = 0;

  while (queue.length) {
    const parentId = queue.shift();
    const key = String(parentId);
    if (visited.has(key)) continue;
    visited.add(key);

    // Check left
    const leftExists = await User.exists({
      placementParent: parentId,
      placementSide: "L",
    });
    if (!leftExists) {
      return { parentId, side: "L" };
    }

    // Check right
    const rightExists = await User.exists({
      placementParent: parentId,
      placementSide: "R",
    });
    if (!rightExists) {
      return { parentId, side: "R" };
    }

    // Enqueue children ordered by activation time (oldest first)
    const children = await User.find({ placementParent: parentId })
      .select("_id activatedAt createdAt placementSide")
      .sort({ activatedAt: 1, createdAt: 1 })
      .lean();

    for (const c of children) {
      queue.push(c._id);
    }

    iterations += 1;
    if (iterations > 10000) {
      throw new Error("Placement search exceeded iteration limit");
    }
  }

  // If sponsor tree is empty (only possible if sponsor not found), caller should handle before
  throw new Error("No placement slot found");
}

export async function POST(request) {
  try {
    await dbConnect();

    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sponsorMemberId, package: pkg } = await request.json();
    if (!sponsorMemberId) {
      return NextResponse.json(
        { error: "sponsorMemberId is required" },
        { status: 400 }
      );
    }

    const buyer = await User.findById(userId);
    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (buyer.isActivated) {
      return NextResponse.json(
        { error: "User is already activated" },
        { status: 400 }
      );
    }

    const sponsor = await User.findOne({ memberId: sponsorMemberId });
    if (!sponsor) {
      return NextResponse.json(
        { error: "Invalid sponsor memberId" },
        { status: 400 }
      );
    }
    if (String(sponsor._id) === String(buyer._id)) {
      return NextResponse.json(
        { error: "User cannot sponsor themselves" },
        { status: 400 }
      );
    }

    // Determine placement slot under sponsor's tree (first available, BFS)
    let updated;
    let retries = 0;
    const maxRetries = 3;
    while (retries <= maxRetries) {
      try {
        const { parentId, side } = await findPlacementSlot(sponsor._id);
        updated = await User.findOneAndUpdate(
          { _id: buyer._id, isActivated: false },
          {
            $set: {
              sponsor: sponsor._id,
              placementParent: parentId,
              placementSide: side,
              isActivated: true,
              activatedAt: new Date(),
              ...(pkg ? { package: pkg } : {}),
            },
          },
          { new: true }
        );

        if (!updated) {
          return NextResponse.json(
            { error: "Activation failed or user already activated" },
            { status: 400 }
          );
        }
        break; // success
      } catch (err) {
        // Unique index collision or placement error: retry limited times
        if (err && err.code === 11000) {
          retries += 1;
          if (retries > maxRetries) throw err;
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(
      {
        message: "Activation successful",
        user: {
          memberId: updated.memberId,
          isActivated: updated.isActivated,
          activatedAt: updated.activatedAt,
          sponsorMemberId: sponsor.memberId,
          placementParent: String(updated.placementParent),
          placementSide: updated.placementSide,
          package: updated.package || "",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
