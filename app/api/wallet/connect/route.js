import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// POST - Connect MetaMask wallet
export async function POST(request) {
  try {
    console.log("Wallet Connect API called");
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      // Get request body
      const body = await request.json();
      const { walletAddress, network } = body;

      // Validate wallet address
      if (!walletAddress) {
        return NextResponse.json(
          { error: "Wallet address is required" },
          { status: 400 }
        );
      }

      // Basic Ethereum address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return NextResponse.json(
          { error: "Invalid wallet address format" },
          { status: 400 }
        );
      }

      console.log("Connecting to database...");
      await dbConnect();
      console.log("Database connected successfully");

      // Check if wallet address is already connected to another user
      const existingWallet = await User.findOne({
        'metamaskWallet.address': walletAddress,
        _id: { $ne: userId }
      });

      if (existingWallet) {
        return NextResponse.json(
          { error: "This wallet address is already connected to another account" },
          { 
            status: 400,
            headers: corsHeaders()
          }
        );
      }

      // Update user's MetaMask wallet information
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'metamaskWallet.address': walletAddress,
            'metamaskWallet.isConnected': true,
            'metamaskWallet.connectedAt': new Date(),
            'metamaskWallet.network': network || 'Ethereum',
          }
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return NextResponse.json(
          { error: "User not found" }, 
          { 
            status: 404,
            headers: corsHeaders()
          }
        );
      }

      console.log("Wallet connected successfully for user:", updatedUser.memberId);

      return NextResponse.json(
        {
          message: "Wallet connected successfully",
          wallet: {
            address: updatedUser.metamaskWallet.address,
            isConnected: updatedUser.metamaskWallet.isConnected,
            connectedAt: updatedUser.metamaskWallet.connectedAt,
            network: updatedUser.metamaskWallet.network,
          }
        },
        { 
          status: 200,
          headers: corsHeaders()
        }
      );

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

  } catch (error) {
    console.error("Wallet Connect API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}

// GET - Get wallet connection status
export async function GET() {
  try {
    console.log("Wallet Status API called");
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      console.log("Connecting to database...");
      await dbConnect();
      console.log("Database connected successfully");

      // Get user's wallet information
      const user = await User.findById(userId).select('metamaskWallet memberId');
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found" }, 
          { 
            status: 404,
            headers: corsHeaders()
          }
        );
      }

      return NextResponse.json(
        {
          wallet: {
            address: user.metamaskWallet?.address || '',
            isConnected: user.metamaskWallet?.isConnected || false,
            connectedAt: user.metamaskWallet?.connectedAt || null,
            network: user.metamaskWallet?.network || '',
          }
        },
        { 
          status: 200,
          headers: corsHeaders()
        }
      );

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

  } catch (error) {
    console.error("Wallet Status API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}

// DELETE - Disconnect wallet
export async function DELETE() {
  try {
    console.log("Wallet Disconnect API called");
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      console.log("Connecting to database...");
      await dbConnect();
      console.log("Database connected successfully");

      // Disconnect user's MetaMask wallet
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'metamaskWallet.address': '',
            'metamaskWallet.isConnected': false,
            'metamaskWallet.connectedAt': null,
            'metamaskWallet.network': '',
          }
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return NextResponse.json(
          { error: "User not found" }, 
          { 
            status: 404,
            headers: corsHeaders()
          }
        );
      }

      console.log("Wallet disconnected successfully for user:", updatedUser.memberId);

      return NextResponse.json(
        {
          message: "Wallet disconnected successfully",
          wallet: {
            address: '',
            isConnected: false,
            connectedAt: null,
            network: '',
          }
        },
        { 
          status: 200,
          headers: corsHeaders()
        }
      );

    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" }, 
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }

  } catch (error) {
    console.error("Wallet Disconnect API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}
