import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { corsHeaders, handleCors } from "@/lib/cors";
import nodemailer from "nodemailer";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "piczelnft@gmail.com",
    pass: "nzft xmyw posx irom",
  },
});

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

    const { name, email, mobile, password, sponsorId, note } = await request.json();

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
    // New users start as inactive until they purchase their first NFT
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      sponsor: sponsor._id,
      isActivated: false,
      holdingWalletBalance: 0,
      note: note || "",
      // New user starts with $0 balance
      wallet: {
        balance: 0,
        address: "",
      },
      walletBalance: 0,
      rewardIncome: 0,
    });

    // Spot income is only distributed when users purchase NFTs, not on signup
    const totalSpotIncome = 0;

    // Send welcome email to the new user
    try {
      await transporter.sendMail({
        from: "piczelnft@gmail.com",
        to: email,
        subject: "Welcome to PICZEL - Registration Successful! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #1565c0; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to PICZEL!</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1565c0;">Registration Successful!</h2>
              <p style="font-size: 16px; color: #333;">Dear ${name},</p>
              <p style="font-size: 16px; color: #333;">Thank you for joining PICZEL! Your account has been created successfully.</p>
              
              <div style="background-color: #f0f7ff; padding: 20px; border-left: 4px solid #1565c0; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #1565c0; margin-top: 0;">Your Account Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Member ID:</td>
                    <td style="padding: 8px 0; color: #333;">${user.memberId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Name:</td>
                    <td style="padding: 8px 0; color: #333;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
                    <td style="padding: 8px 0; color: #333;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Mobile:</td>
                    <td style="padding: 8px 0; color: #333;">${mobile}</td>
                  </tr>
                  ${note ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Password:</td>
                    <td style="padding: 8px 0; color: #333;">${note}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Sponsor ID:</td>
                    <td style="padding: 8px 0; color: #333;">${sponsor.memberId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Registration Date:</td>
                    <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  ⚠️ <strong>Important:</strong> Your account is currently <strong>Inactive</strong>. 
                  Purchase your first NFT to activate your account and start earning!
                </p>
              </div>

              <p style="font-size: 16px; color: #333;">You can now log in to your account and start exploring our NFT marketplace.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.piczelnft.com/login" style="background-color: #1565c0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Login to Your Account</a>
              </div>

              <p style="font-size: 14px; color: #666;">If you have any questions, feel free to contact our support team.</p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                This is an automated email. Please do not reply to this message.<br>
                © 2025 PICZEL. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Error sending welcome email:", emailError);
      // Continue even if email fails - don't block registration
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (password is excluded by the toJSON method)
    return NextResponse.json(
      {
        message: "User created successfully. Purchase your first NFT to activate your account!",
        user,
        token,
        spotIncome: {
          amount: 0,
          message: `Welcome! Your sponsors will receive spot income when you purchase NFTs.`,
        },
        genealogy: {
          sponsorMemberId: sponsor.memberId,
          isActivated: false,
          message: "Account will be activated upon first NFT purchase",
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
