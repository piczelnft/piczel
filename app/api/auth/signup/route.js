import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

// Helper function to distribute spot income to 3 levels
async function distributeSpotIncome(sponsorId, newUserMemberId) {
  const spotIncomeLevels = [3, 1, 1]; // Level 1 = $3, Level 2 = $1, Level 3 = $1
  let currentSponsorId = sponsorId;
  let totalPaid = 0;

  for (let level = 0; level < spotIncomeLevels.length; level++) {
    const spotAmount = spotIncomeLevels[level];
    
    if (!currentSponsorId) {
      console.log(`No sponsor at level ${level + 1}`);
      break;
    }

    const sponsor = await User.findById(currentSponsorId);
    if (!sponsor) {
      console.log(`Sponsor not found at level ${level + 1}`);
      break;
    }

    console.log(`Distributing spot income at Level ${level + 1}: $${spotAmount} to ${sponsor.memberId}`);

    // Update sponsor's balance and spot income
    await User.findByIdAndUpdate(currentSponsorId, {
      $inc: {
        'wallet.balance': spotAmount,
        'walletBalance': spotAmount,
        'rewardIncome': spotAmount
      }
    });

    totalPaid += spotAmount;
    currentSponsorId = sponsor.sponsor; // Move up to next level
  }

  console.log(`Total spot income distributed: $${totalPaid} for new user ${newUserMemberId}`);
  return totalPaid;
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

    // Create new user with direct sponsorship
    const activationTime = new Date();
    
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

    // Distribute spot income to 3 levels: Level 1 = $3, Level 2 = $1, Level 3 = $1
    const totalSpotIncome = await distributeSpotIncome(sponsor._id, user.memberId);

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
          amount: totalSpotIncome,
          message: `Welcome! Your sponsors received $${totalSpotIncome} in spot income for your registration ($3, $1, $1 across 3 levels).`,
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
