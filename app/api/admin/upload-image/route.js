import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// Cloudinary credentials
const CLOUDINARY_CLOUD_NAME = 'dhz4my0yx';
const CLOUDINARY_API_KEY = '464252327352196';
const CLOUDINARY_API_SECRET = '1TqXVvobPGL3nNclq6Ou8THq5Bc';

export async function POST(request) {
  try {
    // Verify admin authentication
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authorization.split(" ")[1];

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get the image from the request
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Generate timestamp and signature for Cloudinary
    const timestamp = Math.round(new Date().getTime() / 1000);
    const crypto = require('crypto');
    
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
      .digest('hex');

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', base64Image);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY);
    cloudinaryFormData.append('signature', signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData
      }
    );

    const cloudinaryData = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      console.error('Cloudinary error:', cloudinaryData);
      return NextResponse.json(
        { error: cloudinaryData.error?.message || 'Upload failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id
    });

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image", details: error.message },
      { status: 500 }
    );
  }
}
