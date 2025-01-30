import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash, compare } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'You must be logged in.' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    // Verify current password
    if (!user.hashedPassword || !(await compare(currentPassword, user.hashedPassword))) {
      return NextResponse.json(
        { message: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    // Update password
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        hashedPassword: await hash(newPassword, 12)
      },
    });

    return NextResponse.json(
      { message: 'Password updated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating password.' },
      { status: 500 }
    );
  }
}
