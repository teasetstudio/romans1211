import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { AsyncIdParam } from '@/types/Params';
import { ORG_ADMIN_PERMISSIONS, ORG_READ_PERMISSIONS } from '@/lib/permissions';

// GET /api/organizations/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { id, ownerId: session.user.id },
          {
            id,
            members: {
              some: {
                userId: session.user.id,
                permissions: {
                  hasSome: ORG_READ_PERMISSIONS
                }
              }
            }
          }
        ]
      },
      include: {
        members: {
          where: {
            userId: session.user.id
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/organizations/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();
    const { id } = await params;

    const updatedOrganization = await prisma.organization.update({
      where: {
        id,
        members: {
          some: {
            userId: session.user.id,
            permissions: { hasSome: [...ORG_ADMIN_PERMISSIONS, 'MANAGE']}
          }
        }
      },
      data: { name, description },
      include: {
        members: {
          where: {
            userId: session.user.id
          }
        }
      },
    });


    if (!updatedOrganization) {
      return NextResponse.json({ error: 'organization not updated' }, { status: 404 });
    }


    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/organizations/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const organization = await prisma.organization.delete({
      where: { 
        id,
        ownerId: session.user.id 
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
