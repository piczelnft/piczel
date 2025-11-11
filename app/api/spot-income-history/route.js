import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import NftPurchase from "@/models/NftPurchase";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// GET - Spot income history from L1, L2, L3 referrals
export async function GET(request) {
  try {
    console.log("Spot Income History API called");

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
      console.log("User token verified");

      await dbConnect();
      console.log("Database connected successfully");

      // Get current user
      const user = await User.findById(decoded.userId).select('memberId name _id');
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      console.log(`Getting spot income history for user: ${user.memberId}`);

      const spotIncomeEntries = [];

      // Spot income amounts per level
      const spotIncomeByLevel = {
        1: 3.00,   // L1 spot income per purchase
        2: 1.00,   // L2 spot income per purchase
        3: 1.00    // L3 spot income per purchase
      };

      // Start with L1: direct referrals
      let currentLevelUsers = await User.find({ sponsor: user._id }).select('memberId name email avatar _id');
      console.log(`L1: Found ${currentLevelUsers.length} direct referrals`);

      // Traverse L1, L2, L3
      for (let level = 1; level <= 3; level++) {
        if (!currentLevelUsers || currentLevelUsers.length === 0) {
          console.log(`Level ${level}: No users found, stopping traversal`);
          break;
        }

        console.log(`Processing level ${level} with ${currentLevelUsers.length} users`);

        // For each user in current level, get their NFT purchases
        for (const referral of currentLevelUsers) {
          try {
            // Get NFT purchases made by this referral user
            const nftPurchases = await NftPurchase.find({
              userId: referral._id
            }).sort({ purchasedAt: -1 });

            console.log(`Referral ${referral.memberId} (Level ${level}) has ${nftPurchases.length} NFT purchases`);

            // Create spot income entry for each purchase
            for (const purchase of nftPurchases) {
              spotIncomeEntries.push({
                level: level,
                referral: {
                  memberId: referral.memberId,
                  name: referral.name,
                  email: referral.email,
                  avatar: referral.avatar
                },
                spotIncome: spotIncomeByLevel[level] || 0,
                nftPurchaseId: purchase._id,
                nftCode: purchase.code,
                nftPrice: purchase.price || 0,
                purchaseDate: purchase.purchasedAt || purchase.createdAt,
                purchasedAt: purchase.purchasedAt || purchase.createdAt
              });
            }
          } catch (err) {
            console.error(`Error processing referral ${referral.memberId}:`, err);
          }
        }

        // Find next level users (those sponsored by current level users)
        const currentLevelIds = currentLevelUsers.map(u => u._id);
        const nextLevelUsers = await User.find({ sponsor: { $in: currentLevelIds } }).select('memberId name email avatar _id');
        console.log(`Next level (L${level + 1}) will have ${nextLevelUsers.length} users`);
        currentLevelUsers = nextLevelUsers;
      }

      // Sort by date descending (most recent first)
      spotIncomeEntries.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

      // Calculate summary by level
      const levelSummaries = {
        1: { count: 0, total: 0 },
        2: { count: 0, total: 0 },
        3: { count: 0, total: 0 }
      };

      spotIncomeEntries.forEach(entry => {
        if (levelSummaries[entry.level]) {
          levelSummaries[entry.level].count += 1;
          levelSummaries[entry.level].total += entry.spotIncome;
        }
      });

      const totalSpotIncome = spotIncomeEntries.reduce((sum, entry) => sum + entry.spotIncome, 0);

      return NextResponse.json(
        {
          user: {
            memberId: user.memberId,
            name: user.name
          },
          spotIncomeHistory: spotIncomeEntries,
          summary: {
            totalEntries: spotIncomeEntries.length,
            totalSpotIncome: parseFloat(totalSpotIncome.toFixed(2)),
            levelSummaries: {
              L1: {
                count: levelSummaries[1].count,
                total: parseFloat(levelSummaries[1].total.toFixed(2))
              },
              L2: {
                count: levelSummaries[2].count,
                total: parseFloat(levelSummaries[2].total.toFixed(2))
              },
              L3: {
                count: levelSummaries[3].count,
                total: parseFloat(levelSummaries[3].total.toFixed(2))
              }
            }
          }
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
    console.error("Spot Income History API error:", error);
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
