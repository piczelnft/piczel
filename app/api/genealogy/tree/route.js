import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Build a subtree up to a given depth for activated users only
async function buildSubtree(root, depth) {
  if (!root || depth < 0) return null;

  const base = {
    id: root.memberId,
    name: root.name,
    profile: root?.profile?.avatar || "",
    package: root.package || "",
    sponsorId: root.sponsor ? String(root.sponsor) : null,
    joinDate: root.activatedAt
      ? root.activatedAt.toISOString().slice(0, 10)
      : "",
    status: root.isActivated ? "Active" : "Inactive",
    directs: 0, // computed below
    leftCount: 0,
    rightCount: 0,
    business: "$0",
  };

  if (depth === 0) {
    return { ...base, left: null, right: null };
  }

  // Find children by placement
  const children = await User.find({
    placementParent: root._id,
    isActivated: true,
  }).lean();

  const leftChild = children.find((c) => c.placementSide === "L") || null;
  const rightChild = children.find((c) => c.placementSide === "R") || null;

  const [leftTree, rightTree] = await Promise.all([
    leftChild ? buildSubtree(leftChild, depth - 1) : Promise.resolve(null),
    rightChild ? buildSubtree(rightChild, depth - 1) : Promise.resolve(null),
  ]);

  // Compute directs and counts
  const directs = children.length;

  function countNodes(node) {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  const leftCount = countNodes(leftTree);
  const rightCount = countNodes(rightTree);

  return {
    ...base,
    directs,
    leftCount,
    rightCount,
    left: leftTree,
    right: rightTree,
  };
}

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

export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const memberId = url.searchParams.get("memberId");
    const depth = Math.max(
      0,
      Math.min(6, parseInt(url.searchParams.get("depth") || "3", 10))
    );

    // Identify root user
    let rootUser = null;
    if (memberId) {
      rootUser = await User.findOne({ memberId, isActivated: true });
      if (!rootUser) {
        return NextResponse.json(
          { error: "Member not found or not activated" },
          { status: 404 }
        );
      }
    } else {
      const userId = getAuthUserId(request);
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      rootUser = await User.findOne({ _id: userId, isActivated: true });
      if (!rootUser) {
        return NextResponse.json(
          { error: "User not activated" },
          { status: 403 }
        );
      }
    }

    const tree = await buildSubtree(rootUser, depth);
    return NextResponse.json({ tree }, { status: 200 });
  } catch (error) {
    console.error("Genealogy tree error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
