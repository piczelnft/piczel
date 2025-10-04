import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { corsHeaders, handleCors } from "@/lib/cors";
import dbConnect from "@/lib/mongodb";
import Withdrawal from "@/models/Withdrawal";
import User from "@/models/User";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

// PUT endpoint to handle withdrawal actions (approve/reject)
export async function PUT(request) {
  try {
    const headersList = await headers();
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

    // Check if user is admin (you might want to add admin role check here)
    // For now, we'll assume the token is from an admin user

    await dbConnect();

    const { requestId, action, adminNotes, transactionHash } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const validActions = ['approve', 'reject', 'processing', 'completed', 'cancelled'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of: " + validActions.join(', ') },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Find the withdrawal request
    const withdrawal = await Withdrawal.findOne({ withdrawalId: requestId });
    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Check if withdrawal is already processed
    if (['completed', 'cancelled', 'rejected'].includes(withdrawal.status)) {
      return NextResponse.json(
        { error: "Withdrawal request has already been processed" },
        { status: 400, headers: corsHeaders() }
      );
    }

    let newStatus;
    let updateData = {
      processedAt: new Date(),
      adminNotes: adminNotes || withdrawal.adminNotes
    };

    // Only set processedBy if userId is a valid ObjectId
    // For admin tokens, userId might be "admin" string, so we skip processedBy
    if (decoded.userId && decoded.userId !== "admin" && mongoose.Types.ObjectId.isValid(decoded.userId)) {
      updateData.processedBy = new mongoose.Types.ObjectId(decoded.userId);
    } else if (decoded.userId === "admin") {
      // For admin users, we can set a special identifier or leave it null
      updateData.processedBy = null; // or you could set it to a special admin ObjectId
    }

    switch (action) {
      case 'approve':
        newStatus = 'processing';
        if (transactionHash) {
          updateData.transactionHash = transactionHash;
        }
        break;
      case 'reject':
        newStatus = 'rejected';
        // If rejecting, we should refund the amount back to user's balance
        try {
          await User.findByIdAndUpdate(
            withdrawal.userId,
            { 
              $inc: { 
                'wallet.balance': withdrawal.amount,
                'walletBalance': withdrawal.amount
              } 
            }
          );
        } catch (refundError) {
          console.error("Error refunding amount:", refundError);
          // Continue with the rejection even if refund fails
        }
        break;
      case 'processing':
        newStatus = 'processing';
        break;
      case 'completed':
        newStatus = 'completed';
        if (transactionHash) {
          updateData.transactionHash = transactionHash;
        }
        break;
      case 'cancelled':
        newStatus = 'cancelled';
        // If cancelling, we should refund the amount back to user's balance
        try {
          await User.findByIdAndUpdate(
            withdrawal.userId,
            { 
              $inc: { 
                'wallet.balance': withdrawal.amount,
                'walletBalance': withdrawal.amount
              } 
            }
          );
        } catch (refundError) {
          console.error("Error refunding amount:", refundError);
          // Continue with the cancellation even if refund fails
        }
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400, headers: corsHeaders() }
        );
    }

    updateData.status = newStatus;

    // Prepare status history update
    const statusHistoryUpdate = {
      status: newStatus,
      changedAt: new Date(),
      notes: adminNotes || null
    };

    // Only add changedBy if userId is a valid ObjectId
    // For admin tokens, userId might be "admin" string, so we skip changedBy
    if (decoded.userId && decoded.userId !== "admin" && mongoose.Types.ObjectId.isValid(decoded.userId)) {
      statusHistoryUpdate.changedBy = new mongoose.Types.ObjectId(decoded.userId);
    } else if (decoded.userId === "admin") {
      // For admin users, we can set a special identifier or leave it null
      statusHistoryUpdate.changedBy = null; // or you could set it to a special admin ObjectId
    }

    // Update the withdrawal request with status history
    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
      withdrawal._id,
      {
        ...updateData,
        $push: {
          statusHistory: statusHistoryUpdate
        }
      },
      { new: true }
    );

    return NextResponse.json(
      { 
        message: `Withdrawal request ${action}d successfully`,
        withdrawal: updatedWithdrawal
      },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Admin withdrawal action API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}