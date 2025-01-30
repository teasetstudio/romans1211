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

    const data = await req.json();
    const { name, currentPassword, newPassword } = data;

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

    // Prepare update data
    const updateData: any = { name };
    
    // If new password is provided, hash it
    if (newPassword) {
      updateData.hashedPassword = await hash(newPassword, 12);
    }

    // Update user information
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Settings updated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating settings.' },
      { status: 500 }
    );
  }
}
