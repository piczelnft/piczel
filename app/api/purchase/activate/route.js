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

async function findPlacementSlot(sponsorId) {
  // Simple binary tree insertion: find the first available slot level by level
  // This ensures each user appears only once and follows standard binary tree structure

  const queue = [sponsorId];
  let iterations = 0;

  while (queue.length && iterations < 1000) {
    const currentParentId = queue.shift();
    iterations++;

    // Check if left slot is available
    const leftChild = await User.findOne({
      placementParent: currentParentId,
      placementSide: "L",
      isActivated: true,
    }).select("_id");

    if (!leftChild) {
      return { parentId: currentParentId, side: "L" };
    }

    // Check if right slot is available
    const rightChild = await User.findOne({
      placementParent: currentParentId,
      placementSide: "R",
      isActivated: true,
    }).select("_id");

    if (!rightChild) {
      return { parentId: currentParentId, side: "R" };
    }

    // Both slots filled, add children to queue for next level
    queue.push(leftChild._id);
    queue.push(rightChild._id);
  }

  throw new Error("No placement slot found - tree may be too deep");
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
        const activationTime = new Date();
        console.log("Setting activatedAt to:", activationTime);

        updated = await User.findOneAndUpdate(
          { _id: buyer._id, isActivated: false },
          {
            $set: {
              sponsor: sponsor._id,
              placementParent: parentId,
              placementSide: side,
              isActivated: true,
              activatedAt: activationTime,
              ...(pkg ? { package: pkg } : {}),
            },
          },
          { new: true }
        );

        console.log("User updated - activatedAt:", updated?.activatedAt);

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
