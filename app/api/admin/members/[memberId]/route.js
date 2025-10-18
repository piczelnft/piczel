import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import Withdrawal from "@/models/Withdrawal";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// Helper function to get all descendant IDs
async function getDescendantIds(userId) {
  const descendants = [];
  const queue = [userId];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await User.find({ sponsor: currentId }).select('_id');
    const childIds = children.map(child => child._id);
    descendants.push(...childIds);
    queue.push(...childIds);
  }
  
  return descendants;
}

// GET - Get a specific member's details
export async function GET(request, { params }) {
  try {
    console.log("Admin Get Member Details API called");

    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Verify this is an admin token
      if (!decoded.isAdmin || decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          {
            status: 403,
            headers: corsHeaders(),
          }
        );
      }

      console.log("Admin get member details request verified");

      // Get memberId from params
      const { memberId } = params;

      if (!memberId) {
        return NextResponse.json(
          { error: "Member ID is required" },
          {
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Find the user
      const user = await User.findOne({ memberId: memberId });

      if (!user) {
        return NextResponse.json(
          { error: "Member not found" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      // Get sponsor information
      let sponsorInfo = null;
      if (user.sponsor) {
        const sponsor = await User.findById(user.sponsor).select('memberId name email');
        if (sponsor) {
          sponsorInfo = {
            sponsorId: sponsor.memberId,
            sponsorName: sponsor.name,
            sponsorEmail: sponsor.email
          };
        }
      }

      // Get team statistics
      const directMembers = await User.find({ sponsor: user._id }).select('_id');
      const directMemberIds = directMembers.map(member => member._id);
      const allDescendants = await getDescendantIds(user._id);

      // Get NFT purchase count
      const nftPurchases = await NftPurchase.find({ userId: user._id });
      const nftPurchaseCount = nftPurchases.length;

      // Get total withdrawals
      const withdrawals = await Withdrawal.find({ userId: user._id, status: 'completed' });
      const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

      // Prepare member details
      const memberDetails = {
        memberId: user.memberId,
        memberName: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        rank: user.rank || "Basic",
        status: user.status || "Active",
        joining: user.createdAt,
        lastLogin: user.lastLogin,
        walletBalance: user.wallet?.balance || user.walletBalance || 0,
        sponsorIncome: user.sponsorIncome || 0,
        levelIncome: user.levelIncome || 0,
        rewardIncome: user.rewardIncome || 0,
        totalWithdrawals: totalWithdrawals,
        directMembers: directMemberIds.length,
        totalTeamMembers: allDescendants.length,
        nftPurchases: nftPurchaseCount,
        ...sponsorInfo
      };

      console.log(`Successfully retrieved member details: ${memberId}`);

      return NextResponse.json(
        {
          member: memberDetails,
        },
        {
          status: 200,
          headers: corsHeaders(),
        }
      );
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error) {
    console.error("Admin Get Member Details API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

// DELETE - Delete a specific member
export async function DELETE(request, { params }) {
  try {
    console.log("Admin Delete Member API called");

    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Verify this is an admin token
      if (!decoded.isAdmin || decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          {
            status: 403,
            headers: corsHeaders(),
          }
        );
      }

      console.log("Admin delete member request verified");

      // Get memberId from params
      const { memberId } = params;

      if (!memberId) {
        return NextResponse.json(
          { error: "Member ID is required" },
          {
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      // Connect to database
      await dbConnect();
      console.log("Database connected successfully");

      // Find the user to delete
      const userToDelete = await User.findOne({ memberId: memberId });

      if (!userToDelete) {
        return NextResponse.json(
          { error: "Member not found" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      // Check if user has any children (sponsored members)
      const childrenCount = await User.countDocuments({
        sponsor: userToDelete._id,
      });

      if (childrenCount > 0) {
        return NextResponse.json(
          {
            error:
              "Cannot delete member with active referrals. Please reassign or delete referrals first.",
          },
          {
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      // Delete the user
      await User.findByIdAndDelete(userToDelete._id);

      console.log(`Successfully deleted member: ${memberId}`);

      return NextResponse.json(
        {
          message: "Member deleted successfully",
          deletedMember: {
            memberId: userToDelete.memberId,
            name: userToDelete.name,
            email: userToDelete.email,
          },
        },
        {
          status: 200,
          headers: corsHeaders(),
        }
      );
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error) {
    console.error("Admin Delete Member API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
