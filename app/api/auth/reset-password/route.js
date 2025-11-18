import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    console.log('Reset password attempt with token:', token ? 'Token present' : 'No token');

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Hash the token to match what we stored
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Looking for user with hashed token');

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    console.log('User found:', !!user);
    
    if (!user) {
      // Check if there's a user with this token but expired
      const expiredUser = await User.findOne({ resetPasswordToken: resetTokenHash });
      if (expiredUser) {
        console.log('Token found but expired for user:', expiredUser.email);
        console.log('Token expired at:', expiredUser.resetPasswordExpires);
        console.log('Current time:', new Date());
      } else {
        console.log('No user found with this reset token');
      }
      
      return NextResponse.json(
        { error: 'Password reset token is invalid or has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Update password directly without re-hashing
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    // We bypass the pre-save hook by updating directly
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      }
    );

    console.log('Password reset successful for user:', user.email);

    return NextResponse.json(
      { message: 'Password has been reset successfully. You can now login with your new password.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
