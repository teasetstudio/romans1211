import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'You must be logged in.' },
        { status: 401 }
      );
    }

    const email = session.user.email;
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail({ name: user.name, email, resetUrl });

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
