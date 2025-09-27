import { NextResponse } from "next/server";

// Simple test endpoint for team members API
export async function GET() {
  try {
    console.log("Test Team Members API called");
    
    const testData = {
      message: "Team Members API is working",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
      sampleData: {
        members: [
          {
            id: "test1",
            memberId: "DGT123456",
            name: "Test User",
            email: "test@example.com",
            downline: 5,
            package: "$100",
            status: "Active"
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalMembers: 1,
          limit: 10
        }
      }
    };
    
    return NextResponse.json(testData);
  } catch (error) {
    console.error("Test Team Members API error:", error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
