import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    console.log('Forgot password request for email:', email);
    console.log('User found:', !!user);

    if (!user) {
      // Don't reveal if user exists or not for security
      console.log('No user found with email:', email);
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token expiry (1 hour from now)
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    console.log('Generated reset token for user:', user.email);
    console.log('Token will expire at:', resetTokenExpiry);

    // Save token to user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    console.log('Token saved to database');

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('Reset URL:', resetUrl);

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'piczelnft@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'nzft xmyw posx irom'
      }
    });

    const mailOptions = {
      from: `"PICZEL NFT Platform" <${process.env.EMAIL_USER || 'piczelnft@gmail.com'}>`,
      to: email,
      subject: 'Password Reset Request - PICZEL NFT',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #1565c0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name || 'User'},</h2>
              <p>We received a request to reset your password for your PICZEL NFT Platform account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will not change until you access the link above and create a new one</li>
                </ul>
              </div>
              
              <p><strong>Account Details:</strong></p>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Member ID:</strong> ${user.memberId || 'N/A'}</li>
                <li><strong>Request Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              
              <p>If you have any questions or concerns, please contact our support team.</p>
              
              <p>Best regards,<br>PICZEL NFT Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} PICZEL NFT Platform. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);

    return NextResponse.json(
      { message: 'Password reset link has been sent to your email' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
