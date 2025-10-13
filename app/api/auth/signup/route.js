import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
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

    const { name, email, mobile, password, sponsorId } = await request.json();

    // Validation
    if (!name || !email || !mobile || !password || !sponsorId) {
      return NextResponse.json(
        { error: "All fields are required including mobile number and sponsorship ID" },
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
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "User with this mobile number already exists" },
          { status: 400 }
        );
      }
    }

    // Validate sponsor exists
    const sponsor = await User.findOne({ memberId: sponsorId.trim() });
    if (!sponsor) {
      return NextResponse.json(
        { error: "Invalid sponsorship ID" },
        { status: 400 }
      );
    }

    // Create new user with direct sponsorship and $3 spot income
    const activationTime = new Date();
    const spotIncomeAmount = 3; // $3 spot income for new users
    
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      sponsor: sponsor._id,
      isActivated: true,
      activatedAt: activationTime,
      // Add $3 spot income to wallet balance
      wallet: {
        balance: spotIncomeAmount,
        address: "",
      },
      walletBalance: spotIncomeAmount,
      rewardIncome: spotIncomeAmount, // Track this as reward income
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
        spotIncome: {
          amount: spotIncomeAmount,
          message: `Congratulations! You received a welcome bonus of $${spotIncomeAmount} in your wallet.`,
        },
        genealogy: {
          sponsorMemberId: sponsor.memberId,
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
