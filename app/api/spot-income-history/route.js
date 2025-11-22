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

      // Get current user - include isActivated and activatedAt to check activation status
      const user = await User.findById(decoded.userId).select('memberId name _id isActivated activatedAt');
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          {
            status: 404,
            headers: corsHeaders(),
          }
        );
      }

      console.log(`Getting spot income history for user: ${user.memberId}, Active: ${user.isActivated}, ActivatedAt: ${user.activatedAt}`);

      const spotIncomeEntries = [];

      // Spot income amounts per level
      const spotIncomeByLevel = {
        1: 3.00,   // L1 spot income per purchase
        2: 1.00,   // L2 spot income per purchase
        3: 1.00    // L3 spot income per purchase
      };

      // Helper function to check if all sponsors in the chain from user to referral are active
      const areAllIntermediateSponsorsActive = async (userId, referralId, level) => {
        console.log(`Checking sponsor chain from ${userId} to ${referralId} at level ${level}`);
        
        // Build the chain from referral back to user
        const chain = [];
        let currentUser = await User.findById(referralId).select('_id memberId sponsor isActivated');
        
        // Traverse up the chain until we reach the original user
        while (currentUser && currentUser._id.toString() !== userId.toString()) {
          chain.push({
            id: currentUser._id.toString(),
            memberId: currentUser.memberId,
            isActivated: currentUser.isActivated
          });
          
          if (!currentUser.sponsor) break;
          currentUser = await User.findById(currentUser.sponsor).select('_id memberId sponsor isActivated');
        }
        
        console.log(`Chain from referral to user:`, chain.map(u => `${u.memberId}(${u.isActivated ? 'active' : 'inactive'})`).join(' -> '));
        
        // The chain should have exactly 'level' members (excluding the user at the top)
        if (chain.length !== level) {
          console.log(`Chain length mismatch: expected ${level}, got ${chain.length}`);
          return false;
        }
        
        // Check if all members in the chain are active
        // For L2+, we need to check that all intermediate sponsors are active
        if (level > 1) {
          // For L2: Check if the direct referral (1 member in chain excluding the actual referral) is active
          // For L3: Check if both intermediate sponsors are active
          for (let i = 1; i < chain.length; i++) {
            if (!chain[i].isActivated) {
              console.log(`Intermediate sponsor ${chain[i].memberId} is inactive - spot income blocked`);
              return false;
            }
          }
        }
        
        return true;
      };

      // Start with L1: direct referrals
      let currentLevelUsers = await User.find({ sponsor: user._id }).select('memberId name email avatar _id sponsor isActivated');
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
            // Note: Spot income is only paid if the user was ACTIVE at the time of purchase
            // We only show purchases that happened while the user was active (not before or after deactivation)
            for (const purchase of nftPurchases) {
              const purchaseDate = new Date(purchase.purchasedAt || purchase.createdAt);
              
              // CRITICAL: Check if user was ACTIVE at the TIME of this purchase
              // This means:
              // 1. User must have been activated before the purchase
              // 2. User must still be active OR purchase happened before deactivation
              
              // Skip if user was not yet activated when purchase happened
              if (!user.activatedAt || purchaseDate < new Date(user.activatedAt)) {
                console.log(`Skipping ${referral.memberId} L${level}: Purchase (${purchaseDate.toISOString()}) before user activation (${user.activatedAt})`);
                continue;
              }
              
              // If user is currently inactive, only show purchases that happened BEFORE deactivation
              // This ensures that if user was deactivated, they don't get credit for purchases after that
              if (!user.isActivated) {
                console.log(`Skipping ${referral.memberId} L${level}: User is currently inactive, no spot income for any purchases`);
                continue;
              }
              
              // CRITICAL: For L2 and L3, check if ALL intermediate sponsors are active
              // For example, if A -> B -> C -> D -> E:
              // - A gets L1 income from B (direct)
              // - A gets L2 income from C only if B is active
              // - A gets L3 income from D only if B AND C are active
              if (level > 1) {
                const chainIsActive = await areAllIntermediateSponsorsActive(user._id, referral._id, level);
                if (!chainIsActive) {
                  console.log(`Skipping ${referral.memberId} L${level}: One or more intermediate sponsors are inactive`);
                  continue;
                }
              }
              
              // Check if user meets conditions for this level
              let meetsCondition = true;
              let conditionNote = '';
              
              if (level === 1) {
                // L1: Must have at least one NFT
                const userHasNft = await NftPurchase.exists({ userId: user._id });
                meetsCondition = userHasNft !== null;
                if (!meetsCondition) conditionNote = 'No NFT purchased';
              } else if (level === 2) {
                // L2: Must have at least 3 ACTIVE direct members
                const activeDirectCount = await User.countDocuments({ sponsor: user._id, isActivated: true });
                meetsCondition = activeDirectCount >= 3;
                if (!meetsCondition) conditionNote = `Only ${activeDirectCount} active directs (need 3 active)`;
              } else if (level === 3) {
                // L3: Must have at least 5 ACTIVE direct members
                const activeDirectCount = await User.countDocuments({ sponsor: user._id, isActivated: true });
                meetsCondition = activeDirectCount >= 5;
                if (!meetsCondition) conditionNote = `Only ${activeDirectCount} active directs (need 5 active)`;
              }
              
              // Only add entry if user meets conditions
              if (meetsCondition) {
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
                  purchasedAt: purchase.purchasedAt || purchase.createdAt,
                  received: true
                });
              } else {
                console.log(`Skipping entry for ${referral.memberId} L${level}: Condition not met - ${conditionNote}`);
              }
            }
          } catch (err) {
            console.error(`Error processing referral ${referral.memberId}:`, err);
          }
        }

        // Find next level users (those sponsored by current level users)
        const currentLevelIds = currentLevelUsers.map(u => u._id);
        const nextLevelUsers = await User.find({ sponsor: { $in: currentLevelIds } }).select('memberId name email avatar _id sponsor isActivated');
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
