import { NextResponse } from "next/server";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleCors(request);
}

export async function POST(request) {
  try {
    console.log("=== Simple Test API Called ===");
    
    const requestBody = await request.json();
    console.log("Request body received:", requestBody);
    
    const response = {
      message: "Simple test successful",
      receivedData: requestBody,
      timestamp: new Date().toISOString()
    };
    
    console.log("Returning response:", response);
    return NextResponse.json(response, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error("Simple test API error:", error);
    return NextResponse.json(
      { 
        error: "Simple test failed", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
