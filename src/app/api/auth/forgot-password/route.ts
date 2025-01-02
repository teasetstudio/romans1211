import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';
import { ResetPasswordEmailTemplate } from "../../send/templates/reset-password-email";
import { defaultResendEmail } from "@/res/consts";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(req: Request) {
  try {
    const { email }: ForgotPasswordRequest = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

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

    await resend.emails.send({
      from: defaultResendEmail,
      to: [email],
      subject: 'Reset your password',
      react: ResetPasswordEmailTemplate({ name: user.name, resetUrl }),
    });

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
