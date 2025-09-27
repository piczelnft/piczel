import { NextResponse } from "next/server";

// Simple dashboard endpoint that returns static data for testing
export async function GET() {
  try {
    console.log("Simple Dashboard API called");
    
    // Return static dashboard data for testing
    const dashboardData = {
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
        clubA: "http://piczelite.com/member/register/DGT123456/ClubA",
        clubB: "http://piczelite.com/member/register/DGT123456/ClubB"
      },
      incomeStats: {
        totalIncome: "5528.13",
        affiliateReward: "4925.13",
        stakingReward: "603.00",
        communityReward: "0.00"
      }
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Simple Dashboard API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
