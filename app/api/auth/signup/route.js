import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
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
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not configured");
      return NextResponse.json(
        {
          error: "Database configuration error. Please contact administrator.",
        },
        { status: 500 }
      );
    }

    await dbConnect();

    const { name, email, password, sponsorId } = await request.json();

    // Validation
    if (!name || !email || !password || !sponsorId) {
      return NextResponse.json(
        { error: "All fields are required including sponsorship ID" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Validate sponsor exists
    const sponsor = await User.findOne({ memberId: sponsorId.trim() });
    if (!sponsor) {
      return NextResponse.json(
        { error: "Invalid sponsorship ID" },
        { status: 400 }
      );
    }

    // Find placement slot under sponsor's tree
    let placementInfo;
    try {
      placementInfo = await findPlacementSlot(sponsor._id);
    } catch (error) {
      console.error("Placement error:", error);
      return NextResponse.json(
        { error: "Unable to find placement in genealogy tree" },
        { status: 400 }
      );
    }

    // Create new user with genealogy information
    const activationTime = new Date();
    const user = await User.create({
      name,
      email,
      password,
      sponsor: sponsor._id,
      placementParent: placementInfo.parentId,
      placementSide: placementInfo.side,
      isActivated: true,
      activatedAt: activationTime,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (password is excluded by the toJSON method)
    return NextResponse.json(
      {
        message: "User created successfully and added to genealogy tree",
        user,
        token,
        genealogy: {
          sponsorMemberId: sponsor.memberId,
          placementParent: String(placementInfo.parentId),
          placementSide: placementInfo.side,
          isActivated: true,
          activatedAt: activationTime,
        },
      },
      {
        status: 201,
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
