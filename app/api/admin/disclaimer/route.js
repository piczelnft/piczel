import { NextResponse } from 'next/server';
import { headers } from "next/headers";
import dbConnect from '@/lib/mongodb';
import Disclaimer from '@/models/Disclaimer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "IamBatman0001";

// GET - Fetch current disclaimer
export async function GET(request) {
  try {
    await dbConnect();

    let disclaimer = await Disclaimer.findOne().sort({ updatedAt: -1 });

    // If no disclaimer exists, create default one
    if (!disclaimer) {
      disclaimer = await Disclaimer.create({
        title: '⚠️ Important Disclaimer',
        sections: [
          {
            heading: 'Platform Notice',
            content: 'Welcome to PICZEL NFT Platform. Please read this disclaimer carefully before using our services.'
          },
          {
            heading: 'Investment Risk',
            content: 'Trading and investing in NFTs and cryptocurrencies involves substantial risk of loss. You should carefully consider whether such activities are suitable for you in light of your circumstances and financial resources.'
          },
          {
            heading: 'No Guarantees',
            content: 'Past performance is not indicative of future results. We make no guarantees regarding profits, returns, or the performance of any NFTs or investments on this platform.'
          },
          {
            heading: 'Your Responsibility',
            content: 'By using this platform, you acknowledge that you are solely responsible for your investment decisions. You should conduct your own research and consult with financial advisors before making any investment decisions.'
          },
          {
            heading: 'Regulatory Compliance',
            content: 'It is your responsibility to ensure compliance with your local laws and regulations. NFT and cryptocurrency regulations vary by jurisdiction.'
          },
          {
            heading: 'Platform Security',
            content: 'While we implement security measures, you are responsible for maintaining the security of your account credentials and wallet information. Never share your password or private keys.'
          }
        ]
      });
    }

    return NextResponse.json(disclaimer);
  } catch (error) {
    console.error('Error fetching disclaimer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disclaimer' },
      { status: 500 }
    );
  }
}

// PUT - Update disclaimer (Admin only)
export async function PUT(request) {
  try {
    console.log('PUT /api/admin/disclaimer called');
    
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get("authorization");

    console.log('Authorization header:', authorization ? 'Present' : 'Missing');

    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log('Unauthorized - no bearer token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authorization.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded:', { isAdmin: decoded.isAdmin, role: decoded.role });
      
      // Verify this is an admin token
      if (!decoded.isAdmin || decoded.role !== 'admin') {
        console.log('Not an admin token');
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    } catch (err) {
      console.log('Token verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();
    console.log('Database connected');

    const body = await request.json();
    const { title, sections } = body;
    
    console.log('Request body:', { title, sectionsCount: sections?.length });

    if (!title || !sections || sections.length === 0) {
      console.log('Invalid data - missing title or sections');
      return NextResponse.json(
        { error: 'Title and at least one section are required' },
        { status: 400 }
      );
    }

    let disclaimer = await Disclaimer.findOne().sort({ updatedAt: -1 });
    console.log('Existing disclaimer found:', !!disclaimer);

    if (disclaimer) {
      disclaimer.title = title;
      disclaimer.sections = sections;
      disclaimer.updatedBy = decoded.username || decoded.email || 'admin';
      disclaimer.updatedAt = new Date();
      await disclaimer.save();
      console.log('Disclaimer updated');
    } else {
      disclaimer = await Disclaimer.create({
        title,
        sections,
        updatedBy: decoded.username || decoded.email || 'admin'
      });
      console.log('Disclaimer created');
    }

    return NextResponse.json({
      success: true,
      disclaimer
    });
  } catch (error) {
    console.error('Error updating disclaimer:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to update disclaimer', details: error.message },
      { status: 500 }
    );
  }
}
