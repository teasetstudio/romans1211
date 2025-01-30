import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { Resend } from 'resend';
import crypto from 'crypto';
import { VerificationEmailTemplate } from "../../send/templates/verification-email";
import { defaultResendEmail } from "@/res/consts";
import { sendEmail } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export async function POST(req: Request) {
  try {
    const { email, password, name }: RegisterRequest = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but email is not verified, update their data and resend verification
      if (!existingUser.emailVerified) {
        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Update user data
        await prisma.user.update({
          where: { email },
          data: {
            name,
            hashedPassword: await bcrypt.hash(password, 12),
            verificationToken,
          },
        });

        // Send verification email
        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
        await resend.emails.send({
          from: defaultResendEmail,
          to: [email],
          subject: 'Verify your email address',
          react: VerificationEmailTemplate({ name, verificationUrl }),
        });

        return NextResponse.json(
          { message: "Registration updated. Please check your email to verify your account." },
          { status: 200 }
        );
      }

      // If user exists and is verified, return error
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        verificationToken,
      },
    });

    // Create default organization
    await prisma.organization.create({
      data: {
        name,
        isDefault: true,
        userId: user.id,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      toEmails: [email],
      subject: 'Verify your email address',
      react: VerificationEmailTemplate({ name, verificationUrl })
    });
    // await resend.emails.send({
    //   from: defaultResendEmail,
    //   to: [email],
    //   subject: 'Verify your email address',
    //   react: VerificationEmailTemplate({ name, verificationUrl }),
    // });

    return NextResponse.json(
      { message: "Registration successful. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
