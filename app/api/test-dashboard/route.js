import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Test dashboard endpoint called");
    
    // Test basic functionality
    const testData = {
      message: "Dashboard API is working",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
      }
    };
    
    return NextResponse.json(testData);
  } catch (error) {
    console.error("Test dashboard error:", error);
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
