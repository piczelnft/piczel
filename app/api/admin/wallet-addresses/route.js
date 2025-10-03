import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

export async function GET(request) {
  try {
    // Handle CORS preflight
    const headersList = headers();
    const origin = headersList.get("origin");
    
    // Verify admin authentication
    const authorization = headersList.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build search query for wallet addresses
    let searchQuery = {};
    
    if (search) {
      searchQuery = {
        $or: [
          { memberId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { 'metamaskWallet.address': { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch users with wallet information
    const [users, totalCount] = await Promise.all([
      User.find(searchQuery)
        .select('memberId name email mobile metamaskWallet createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(searchQuery)
    ]);

    // Format wallet address data
    const walletAddresses = users.map((user) => ({
      _id: user._id,
      memberId: user.memberId || 'N/A',
      memberName: user.name || 'Unknown',
      memberEmail: user.email || 'N/A',
      memberMobile: user.mobile || 'N/A',
      address: user.metamaskWallet?.address || null,
      isConnected: user.metamaskWallet?.isConnected || false,
      connectedAt: user.metamaskWallet?.connectedAt || null,
      network: user.metamaskWallet?.network || null,
      createdAt: user.createdAt
    }));

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const pagination = {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: skip + 1,
      endIndex: Math.min(skip + limit, totalCount)
    };

    // Calculate statistics
    const connectedWallets = walletAddresses.filter(w => w.isConnected).length;
    const disconnectedWallets = walletAddresses.filter(w => !w.isConnected).length;
    const connectionRate = totalCount > 0 ? Math.round((connectedWallets / totalCount) * 100) : 0;

    const stats = {
      totalWallets: totalCount,
      connectedWallets,
      disconnectedWallets,
      connectionRate
    };

    return NextResponse.json(
      { 
        walletAddresses, 
        pagination, 
        stats 
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Admin wallet addresses API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST endpoint to manually connect/disconnect a wallet (admin action)
export async function POST(request) {
  try {
    // Handle CORS preflight
    const headersList = headers();
    
    // Verify admin authentication
    const authorization = headersList.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    await dbConnect();

    const { userId, action, walletAddress, network } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (action === 'connect') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: "Wallet address is required for connection" },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Check if wallet is already connected to another user
      const existingUser = await User.findOne({
        'metamaskWallet.address': walletAddress,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "This wallet is already connected to another user" },
          { status: 400, headers: corsHeaders() }
        );
      }

      user.metamaskWallet.address = walletAddress;
      user.metamaskWallet.isConnected = true;
      user.metamaskWallet.connectedAt = new Date();
      user.metamaskWallet.network = network || 'unknown';

    } else if (action === 'disconnect') {
      user.metamaskWallet.address = '';
      user.metamaskWallet.isConnected = false;
      user.metamaskWallet.connectedAt = null;
      user.metamaskWallet.network = '';

    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'connect' or 'disconnect'" },
        { status: 400, headers: corsHeaders() }
      );
    }

    await user.save();

    return NextResponse.json(
      { 
        message: `Wallet ${action}ed successfully`,
        wallet: user.metamaskWallet 
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Admin wallet action API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// DELETE endpoint to disconnect a wallet (admin action)
export async function DELETE(request) {
  try {
    // Handle CORS preflight
    const headersList = headers();
    
    // Verify admin authentication
    const authorization = headersList.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authorization.split(" ")[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Disconnect the wallet
    user.metamaskWallet.address = '';
    user.metamaskWallet.isConnected = false;
    user.metamaskWallet.connectedAt = null;
    user.metamaskWallet.network = '';

    await user.save();

    return NextResponse.json(
      { 
        message: "Wallet disconnected successfully",
        wallet: user.metamaskWallet 
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Admin wallet disconnect API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
