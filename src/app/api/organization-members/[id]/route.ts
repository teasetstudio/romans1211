import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ORG_ADMIN_PERMISSIONS } from '@/lib/permissions';
import { AsyncIdParam } from '@/types/Params';
import { z } from 'zod';
import { OrganizationPermission } from '@prisma/client';

// Schema for updating member permissions
const updateMemberPermissionsSchema = z.object({
  permissions: z.array(z.enum([
    "ADMIN",
    "MANAGE",
    "CREATE",
    "EDIT",
    "DELETE",
    "READ",
    "ADMIN_LIBRARY",
    "MANAGE_LIBRARY",
    "CREATE_LIBRARY",
    "EDIT_LIBRARY",
    "DELETE_LIBRARY",
    "READ_LIBRARY",
    "ADMIN_COURSES",
    "MANAGE_COURSES",
    "CREATE_COURSES",
    "EDIT_COURSES",
    "DELETE_COURSES",
    "READ_COURSES"
  ])),
});

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

export async function PATCH(
  request: Request,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the member to be updated
    const memberToUpdate = await prisma.organizationMember.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!memberToUpdate) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent updating the owner's permissions
    if (memberToUpdate.userId === memberToUpdate.organization.ownerId) {
      return NextResponse.json({ error: 'Cannot update organization owner permissions' }, { status: 400 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const result = updateMemberPermissionsSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid permissions data' }, { status: 400 });
    }

    const { permissions } = result.data;

    // Check if user has permission to update member permissions
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: memberToUpdate.organizationId,
        userId: session.user.id,
        isAccepted: true,
      },
    });

    if (!userMembership || !userMembership.permissions.some(p => ORG_ADMIN_PERMISSIONS.includes(p))) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update the member's permissions
    const updatedMember = await prisma.organizationMember.update({
      where: { id },
      data: { permissions: permissions as OrganizationPermission[] },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating organization member permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update organization member permissions' },
      { status: 500 }
    );
  }
} 