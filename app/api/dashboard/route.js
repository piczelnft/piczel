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

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only";

export async function GET() {
  try {
    console.log("Dashboard API called");
    
    // Check if required environment variables are available
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not found in environment variables");
    }
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log("No valid authorization header found");
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
      try {
        await dbConnect();
        console.log("Database connected successfully");
      } catch (dbError) {
        console.error("Database connection failed:", dbError);
        // Return fallback data if database connection fails
        const fallbackData = {
          memberId: "DGT123456",
          status: "Active",
          rank: "Basic",
          totalTeam: 863,
          myDirects: 65,
          wallet: "4926.13",
          depositWallet: "0.00",
          capping: {
            total: 40800,
            used: 5528.13,
            balance: 35271.87
          },
          clubStats: {
            clubATeam: 839,
            clubBTeam: 24,
            clubABusiness: 1135733.00,
            clubBBusiness: 0.00
          },
          deposits: {
            total: 100.00,
            investment: "10200 / 1,478.26 USDG",
            matching: 0
          },
          withdrawals: {
            total: "USDG 82.19",
            today: "USDG 0"
          },
          referralLinks: {
            clubA: `http://piczelite.com/member/register/DGT123456/ClubA`,
            clubB: `http://piczelite.com/member/register/DGT123456/ClubB`
          },
        totalNftPurchases: 5,
        totalNftPurchaseAmount: "500.00", // 5 NFTs × $100 = $500
        totalLevelIncome: "0.00",
        totalSpotIncome: "850.75",
        directMembersNftVolume: "200.00", // 2 NFTs × $100 = $200 (example)
        totalMembersNftVolume: "500.00", // 5 NFTs × $100 = $500 (example)
        };
        
        return NextResponse.json(
          fallbackData,
          { 
            status: 200,
            headers: corsHeaders()
          }
        );
      }

      // Get user data
      console.log("Fetching user data for userId:", userId);
      const user = await User.findById(userId).select('memberId name email sponsorIncome levelIncome rewardIncome wallet.balance walletBalance isActivated package sponsoredMembersVolume sponsor deactivationScheduledAt');
      
      // Get sponsor information
      let sponsorInfo = null;
      if (user && user.sponsor) {
        try {
          const sponsor = await User.findById(user.sponsor).select('name email memberId');
          if (sponsor) {
            sponsorInfo = {
              name: sponsor.name,
              email: sponsor.email,
              memberId: sponsor.memberId
            };
          }
        } catch (sponsorError) {
          console.error("Error fetching sponsor info:", sponsorError);
        }
      }
      
      // Combine sponsorIncome and levelIncome
      const combinedLevelIncome = (user.sponsorIncome || 0) + (user.levelIncome || 0);
      console.log(`Dashboard level income calculation:`, {
        sponsorIncome: user.sponsorIncome,
        levelIncome: user.levelIncome,
        combinedLevelIncome
      });
      
      console.log("Dashboard API - Raw user data:", {
        memberId: user?.memberId,
        sponsorIncome: user?.sponsorIncome,
        levelIncome: user?.levelIncome,
        rewardIncome: user?.rewardIncome,
        walletBalance: user?.wallet?.balance,
        walletBalanceField: user?.walletBalance
      });
      if (!user) {
        console.log("User not found, returning fallback data");
        // Return fallback data instead of error for development
        const fallbackData = {
          memberId: "DGT123456",
          status: "Active",
          rank: "Basic",
          totalTeam: 863,
          myDirects: 65,
          wallet: "4926.13",
          depositWallet: "0.00",
          capping: {
            total: 40800,
            used: 5528.13,
            balance: 35271.87
          },
          clubStats: {
            clubATeam: 839,
            clubBTeam: 24,
            clubABusiness: 1135733.00,
            clubBBusiness: 0.00
          },
          deposits: {
            total: 100.00,
            investment: "10200 / 1,478.26 USDG",
            matching: 0
          },
          withdrawals: {
            total: "USDG 82.19",
            today: "USDG 0"
          },
          referralLinks: {
            clubA: `http://piczelite.com/member/register/DGT123456/ClubA`,
            clubB: `http://piczelite.com/member/register/DGT123456/ClubB`
          },
        incomeStats: {
          totalIncome: "5528.13",
          affiliateReward: "4925.13",
          stakingReward: "603.00",
          communityReward: "0.00"
        },
        totalNftPurchases: 5,
        totalNftPurchaseAmount: "500.00", // 5 NFTs × $100 = $500
        totalSponsorsIncome: "1250.50",
        totalLevelIncome: "0.00",
        totalWithdrawalAmount: "750.25",
        totalSpotIncome: "850.75",
        directMembersNftVolume: "200.00", // 2 NFTs × $100 = $200 (example)
        totalMembersNftVolume: "500.00", // 5 NFTs × $100 = $500 (example)
        memberVolumes: {
          sponsoredMembersVolume: "2500.00",
          directMembersVolume: "1250.50",
          totalMembersVolume: "3850.25"
        }
        };
        
        return NextResponse.json(
          fallbackData,
          { 
            status: 200,
            headers: corsHeaders()
          }
        );
      }
      
      console.log("User found:", user.memberId);

      // Calculate team statistics
      const directTeam = await User.countDocuments({ sponsor: userId });
      
      // Get descendant IDs with error handling
      let descendantIds = [];
      try {
        descendantIds = await getDescendantIds(userId);
      } catch (descError) {
        console.error("Error getting descendant IDs:", descError);
        descendantIds = [];
      }
      
      const totalTeam = await User.countDocuments({
        $or: [
          { sponsor: userId },
          { sponsor: { $in: descendantIds } }
        ]
      });

      // Calculate wallet balance (convert to number for consistency)
      // Total balance = combined level income (sponsor + level) + spot income (reward income)
      const rewardIncome = user.rewardIncome || 0; // This includes spot income
      const walletBalance = combinedLevelIncome + rewardIncome; // Use combined level income

      // Get club statistics (Club A and Club B teams) with error handling
      let clubAStats = { count: 0, business: 0 };
      let clubBStats = { count: 0, business: 0 };
      
      try {
        clubAStats = await calculateClubStats(userId, "A", descendantIds);
        clubBStats = await calculateClubStats(userId, "B", descendantIds);
      } catch (clubError) {
        console.error("Error calculating club stats:", clubError);
      }

      // Calculate total deposits and investments
      const totalDeposits = await calculateTotalDeposits(userId);
      const totalInvestments = await calculateTotalInvestments(userId);

      // Calculate withdrawal statistics
      const withdrawalStats = await calculateWithdrawalStats(userId);

      // Calculate income statistics
      const incomeStats = await calculateIncomeStats(userId);

      // Prepare dashboard data
      const dashboardData = {
        memberId: user.memberId || "DGT123456",
        status: user.isActivated ? "Active" : "Inactive",
        rank: user.package || "Basic",
        totalTeam,
        myDirects: directTeam,
        wallet: walletBalance.toFixed(4),
        depositWallet: "0.00", // This would come from a separate deposits collection
        capping: {
          total: 40800,
          used: walletBalance,
          balance: 40800 - walletBalance
        },
        clubStats: {
          clubATeam: clubAStats.count,
          clubBTeam: clubBStats.count,
          clubABusiness: clubAStats.business,
          clubBBusiness: clubBStats.business
        },
        deposits: {
          total: totalDeposits,
          investment: totalInvestments,
          matching: 0 // This would be calculated based on business rules
        },
        withdrawals: {
          total: withdrawalStats.total,
          today: withdrawalStats.today
        },
        referralLinks: {
          clubA: `http://piczelite.com/member/register/${user.memberId}/ClubA`,
          clubB: `http://piczelite.com/member/register/${user.memberId}/ClubB`
        },
        incomeStats: {
          totalIncome: incomeStats.totalIncome,
          affiliateReward: incomeStats.affiliateReward,
          stakingReward: incomeStats.stakingReward,
          communityReward: incomeStats.communityReward
        },
        totalNftPurchases: await calculateTotalNftPurchases(userId),
        totalNftPurchaseAmount: await calculateTotalNftPurchaseAmount(userId),
        totalSponsorsIncome: await calculateTotalSponsorsIncome(userId),
        totalLevelIncome: combinedLevelIncome.toFixed(4), // Combined sponsorIncome + levelIncome
        totalWithdrawalAmount: await calculateTotalWithdrawalAmount(userId),
        totalSpotIncome: (user.rewardIncome || 0).toFixed(4),
        directMembersNftVolume: await calculateDirectMembersNftVolume(userId),
        totalMembersNftVolume: await calculateTotalMembersNftVolume(userId),
        memberVolumes: {
          sponsoredMembersVolume: user.sponsoredMembersVolume || 0,
          directMembersVolume: await calculateDirectMembersNftVolume(userId),
          totalMembersVolume: await calculateTotalMembersNftVolume(userId)
        },
        sponsorInfo: sponsorInfo,
        deactivationScheduledAt: user.deactivationScheduledAt || null
      };

      console.log("Dashboard API - Final response data:", {
        totalLevelIncome: dashboardData.totalLevelIncome,
        totalSponsorsIncome: dashboardData.totalSponsorsIncome,
        totalSpotIncome: dashboardData.totalSpotIncome,
        wallet: dashboardData.wallet
      });

      return NextResponse.json(
        dashboardData,
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
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}

// Helper function to get all descendant user IDs recursively with depth limit
async function getDescendantIds(userId, depth = 0, maxDepth = 10) {
  if (depth >= maxDepth) {
    console.warn(`Max depth reached for user ${userId}`);
    return [];
  }
  
  try {
    const descendants = [];
    const directChildren = await User.find({ sponsor: userId }).select("_id").limit(1000);
    
    for (const child of directChildren) {
      descendants.push(child._id);
      const grandChildren = await getDescendantIds(child._id, depth + 1, maxDepth);
      descendants.push(...grandChildren);
    }
    
    return descendants;
  } catch (error) {
    console.error(`Error getting descendants for user ${userId}:`, error);
    return [];
  }
}

// Helper function to calculate club statistics
async function calculateClubStats(userId, clubType, descendantIds = []) {
  try {
    // Use provided descendant IDs or get them
    const allDescendants = descendantIds.length > 0 ? descendantIds : await getDescendantIds(userId);
    
    // Simulate club distribution (80% Club A, 20% Club B)
    const clubMembers = clubType === "A" 
      ? allDescendants.slice(0, Math.floor(allDescendants.length * 0.8))
      : allDescendants.slice(Math.floor(allDescendants.length * 0.8));
    
    return {
      count: clubMembers.length,
      business: clubMembers.length * 1000 // Simulated business volume
    };
  } catch (error) {
    console.error(`Error calculating club stats for ${clubType}:`, error);
    return { count: 0, business: 0 };
  }
}

// Helper function to calculate total deposits
async function calculateTotalDeposits(userId) {
  // This would typically come from a deposits/transactions collection
  // For now, return a simulated value
  return 100.00;
}

// Helper function to calculate total investments
async function calculateTotalInvestments(userId) {
  // This would typically come from an investments collection
  // For now, return a simulated value
  return 10200.00;
}

// Helper function to calculate withdrawal statistics
async function calculateWithdrawalStats(userId) {
  // This would typically come from a withdrawals collection
  // For now, return simulated values
  return {
    total: 82.19,
    today: 0
  };
}

// Helper function to calculate income statistics
async function calculateIncomeStats(userId) {
  try {
    // Get user's wallet balance as base for calculations
    const user = await User.findById(userId).select("wallet package isActivated");
    const walletBalance = user?.wallet?.balance || 0;
    
    // Calculate different income types based on user data and team size
    const directTeam = await User.countDocuments({ sponsor: userId });
    const allDescendants = await getDescendantIds(userId);
    
    // Affiliate Reward (based on direct referrals and their activity)
    const affiliateReward = directTeam * 75.77; // Simulated calculation
    
    // Monthly Staking Reward (based on user's package and balance)
    const stakingReward = walletBalance * 0.1224; // 12.24% monthly return simulation
    
    // Community Reward (based on total team size)
    const communityReward = allDescendants.length * 0.5; // Simulated community earnings
    
    // Total Income
    const totalIncome = affiliateReward + stakingReward + communityReward;
    
    return {
      totalIncome: totalIncome.toFixed(2),
      affiliateReward: affiliateReward.toFixed(2),
      stakingReward: stakingReward.toFixed(2),
      communityReward: communityReward.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating income stats:", error);
    // Return fallback values
    return {
      totalIncome: "5528.13",
      affiliateReward: "4925.13",
      stakingReward: "603.00",
      communityReward: "0.00"
    };
  }
}

// Helper function to calculate total NFT purchases
async function calculateTotalNftPurchases(userId) {
  try {
    // Import NftPurchase model
    const NftPurchase = (await import("@/models/NftPurchase")).default;
    const count = await NftPurchase.countDocuments({ userId });
    return count;
  } catch (error) {
    console.error("Error calculating total NFT purchases:", error);
    return 0;
  }
}

// Helper function to calculate total NFT purchase amount
async function calculateTotalNftPurchaseAmount(userId) {
  try {
    // Import NftPurchase model
    const NftPurchase = (await import("@/models/NftPurchase")).default;
    const purchases = await NftPurchase.find({ userId }).select('price');
    
    // Each NFT purchase: $100 - user receives full amount in wallet
    // Commissions are deducted invisibly and paid to sponsors over 365 days
    const amountPerNft = 100; // User sees full $100 in wallet
    const totalAmount = purchases.length * amountPerNft;
    
    return totalAmount.toFixed(2);
  } catch (error) {
    console.error("Error calculating total NFT purchase amount:", error);
    return "0.00";
  }
}

// Helper function to calculate total sponsors income
async function calculateTotalSponsorsIncome(userId) {
  try {
    const user = await User.findById(userId).select("sponsorIncome");
    const totalSponsorsIncome = user?.sponsorIncome || 0;
    return totalSponsorsIncome.toFixed(2);
  } catch (error) {
    console.error("Error calculating total sponsors income:", error);
    return "0.00";
  }
}

// Helper function to calculate total withdrawal amount
async function calculateTotalWithdrawalAmount(userId) {
  try {
    // Import Withdrawal model
    const Withdrawal = (await import("@/models/Withdrawal")).default;
    const withdrawals = await Withdrawal.find({ userId, status: 'completed' });
    const total = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
    return total.toFixed(2);
  } catch (error) {
    console.error("Error calculating total withdrawal amount:", error);
    return "0.00";
  }
}

// Helper function to calculate direct members NFT volume
async function calculateDirectMembersNftVolume(userId) {
  try {
    // Import NftPurchase model
    const NftPurchase = (await import("@/models/NftPurchase")).default;
    
    // Get direct members (users with this user as sponsor)
    const directMembers = await User.find({ sponsor: userId }).select("_id");
    const directMemberIds = directMembers.map(member => member._id);
    
    console.log(`Direct members found: ${directMemberIds.length} for user ${userId}`);
    
    // If no direct members, return 0
    if (directMemberIds.length === 0) {
      console.log("No direct members found, returning 0.00");
      return "0.00";
    }
    
    // Calculate total NFT purchase amount from direct members
    // Each NFT purchase represents $100 (commissions deducted invisibly)
    const directMembersPurchases = await NftPurchase.find({ 
      userId: { $in: directMemberIds } 
    });
    
    console.log(`NFT purchases found for direct members: ${directMembersPurchases.length}`);
    
    // Calculate total amount: number of purchases × $100 per NFT
    const totalVolume = directMembersPurchases.length * 100;
    
    console.log(`Total direct members NFT volume: ${totalVolume}`);
    return totalVolume.toFixed(2);
  } catch (error) {
    console.error("Error calculating direct members NFT volume:", error);
    return "0.00";
  }
}

// Helper function to calculate total members NFT volume (all team members, excluding user)
async function calculateTotalMembersNftVolume(userId) {
  try {
    // Import NftPurchase model
    const NftPurchase = (await import("@/models/NftPurchase")).default;
    
    // Get all descendant IDs (all team members, not including user themselves)
    const allDescendants = await getDescendantIds(userId);
    
    console.log(`Total descendants found: ${allDescendants.length} for user ${userId}`);
    
    // If no team members, return 0
    if (allDescendants.length === 0) {
      console.log("No descendants found, returning 0.00");
      return "0.00";
    }
    
    // Calculate total NFT purchase amount from all team members
    // Each NFT purchase represents $100 (commissions deducted invisibly)
    const allMembersPurchases = await NftPurchase.find({ 
      userId: { $in: allDescendants } 
    });
    
    console.log(`NFT purchases found for all members: ${allMembersPurchases.length}`);
    
    // Calculate total amount: number of purchases × $100 per NFT
    const totalVolume = allMembersPurchases.length * 100;
    
    console.log(`Total members NFT volume: ${totalVolume}`);
    return totalVolume.toFixed(2);
  } catch (error) {
    console.error("Error calculating total members NFT volume:", error);
    return "0.00";
  }
}
