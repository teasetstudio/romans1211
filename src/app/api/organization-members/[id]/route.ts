import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ORG_ADMIN_PERMISSIONS } from '@/lib/permissions';
import { AsyncIdParam } from '@/types/Params';

export async function DELETE(
  request: Request,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the member to be deleted
    const memberToDelete = await prisma.organizationMember.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!memberToDelete) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if the user is the owner of the organization
    const isOwner = memberToDelete.userId === memberToDelete.organization.ownerId;

    // Prevent removing the owner
    if (isOwner) {
      return NextResponse.json({ error: 'Cannot remove the organization owner' }, { status: 400 });
    }

    // If not owner, check if user has MANAGE permissions
    if (!isOwner) {
      const userMembership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: memberToDelete.organizationId,
          userId: session.user.id,
          isAccepted: true,
        },
      });

      if (!userMembership || !userMembership.permissions.some(p => ORG_ADMIN_PERMISSIONS.includes(p))) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Delete the member
    await prisma.organizationMember.delete({ where: { id } });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing organization member:', error);
    return NextResponse.json(
      { error: 'Failed to remove organization member' },
      { status: 500 }
    );
  }
} 