import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { corsHeaders, handleCors } from "@/lib/cors";
import jwt from "jsonwebtoken";

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
        {
          error:
            "All fields are required including mobile number and sponsorship ID",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email" },
        { status: 400 }
      );
    }

    // Validate mobile format
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(mobile.replace(/[\s\-\(\)]/g, ""))) {
      return NextResponse.json(
        { error: "Please provide a valid mobile number" },
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

    // Create new user with direct sponsorship
    const activationTime = new Date();
    const spotIncomeAmount = 3; // $3 spot income for sponsor when new user signs up
    
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      sponsor: sponsor._id,
      isActivated: true,
      activatedAt: activationTime,
      // New user starts with $0 balance
      wallet: {
        balance: 0,
        address: "",
      },
      walletBalance: 0,
      rewardIncome: 0,
    });

    // Give $3 spot income to the sponsor
    await User.findByIdAndUpdate(sponsor._id, {
      $inc: {
        'wallet.balance': spotIncomeAmount,
        'walletBalance': spotIncomeAmount,
        'rewardIncome': spotIncomeAmount
      }
    });

    // Generate a temporary token for the login link
    const tempToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: "admin_created_login",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Generate the login link with prefilled data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const loginLink = `${baseUrl}/login?token=${tempToken}&email=${encodeURIComponent(
      email
    )}&name=${encodeURIComponent(name)}`;

    // Return success with login link
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          memberId: user.memberId,
          sponsor: {
            id: sponsor._id,
            name: sponsor.name,
            memberId: sponsor.memberId,
          },
          isActivated: user.isActivated,
          activatedAt: user.activatedAt,
          createdAt: user.createdAt,
          wallet: user.wallet,
          walletBalance: user.walletBalance,
        },
        loginLink,
        spotIncome: {
          amount: spotIncomeAmount,
          message: `User created successfully. Sponsor (${sponsor.memberId}) received $${spotIncomeAmount} as spot income.`,
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
    console.error("Admin user creation error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email or mobile number already exists" },
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
