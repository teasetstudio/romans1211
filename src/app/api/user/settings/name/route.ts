import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Name is required.' },
        { status: 400 }
      );
    }

    // Update user name
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    });

    return NextResponse.json(
      { newName: name },
      { status: 200 }
    );
  } catch (error) {
    console.error('Name update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating name.' },
      { status: 500 }
    );
  }
}
