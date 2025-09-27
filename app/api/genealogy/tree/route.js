import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Build a subtree up to a given depth for activated users only
async function buildSubtree(root, depth, visitedNodes = new Set()) {
  if (!root || depth < 0) return null;

  // Prevent infinite loops and duplicate nodes
  const nodeKey = String(root._id);
  if (visitedNodes.has(nodeKey)) {
    console.warn(`Duplicate node detected: ${root.memberId || nodeKey}`);
    return null;
  }
  visitedNodes.add(nodeKey);

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
    totalCount: 0,
    business: `$${(root.wallet?.balance || 0).toFixed(2)}`,
  };

  if (depth === 0) {
    return { ...base, children: [] };
  }

  // Find direct children (sponsored by this user, only activated users)
  const children = await User.find({
    sponsor: root._id,
    isActivated: true,
  })
    .select(
      "_id memberId name profile package sponsor activatedAt isActivated wallet"
    )
    .lean();

  console.log(
    `Direct children of ${root.memberId}:`,
    children.map((c) => ({
      memberId: c.memberId,
      activatedAt: c.activatedAt,
    }))
  );

  // Build subtrees recursively for each child
  const childTrees = await Promise.all(
    children.map((child) =>
      buildSubtree(child, depth - 1, new Set(visitedNodes))
    )
  );

  // Filter out any null results
  const validChildTrees = childTrees.filter((child) => child !== null);

  // Compute metrics
  const directs = children.length;

  function countNodes(node) {
    if (!node) return 0;
    return (
      1 +
      (node.children
        ? node.children.reduce((sum, child) => sum + countNodes(child), 0)
        : 0)
    );
  }

  const totalCount = validChildTrees.reduce(
    (sum, child) => sum + countNodes(child),
    0
  );

  return {
    ...base,
    directs,
    totalCount,
    children: validChildTrees,
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
      rootUser = await User.findOne({ memberId, isActivated: true }).select(
        "_id memberId name profile package sponsor activatedAt isActivated wallet"
      );
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
      rootUser = await User.findOne({ _id: userId, isActivated: true }).select(
        "_id memberId name profile package sponsor activatedAt isActivated wallet"
      );
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
