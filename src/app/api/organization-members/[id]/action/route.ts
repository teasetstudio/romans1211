import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AsyncIdParam } from "@/types/Params";

export async function POST(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: memberId } = await params;
    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Get the action from query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action || !['accept', 'reject', 'leave'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept', 'reject', or 'leave'" },
        { status: 400 }
      );
    }

    // Get the member
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: { 
        user: true,
        organization: true 
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // For accept/reject, verify the user is the one being invited
    if (['accept', 'reject'].includes(action) && member.user.email !== session.user.email) {
      return NextResponse.json(
        { error: `You can only ${action} your own invitations` },
        { status: 403 }
      );
    }

    // For leave, verify the user is the member and not the owner
    if (action === 'leave') {
      if (member.user.email !== session.user.email) {
        return NextResponse.json(
          { error: "You can only leave organizations you are a member of" },
          { status: 403 }
        );
      }

      if (member.organization.ownerId === session.user.id) {
        return NextResponse.json(
          { error: "Organization owners cannot leave their organization" },
          { status: 400 }
        );
      }
    }

    if (action === 'accept') {
      // Update the member to accepted
      const updatedMember = await prisma.organizationMember.update({
        where: { id: memberId },
        data: {
          isAccepted: true,
          acceptedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: true,
        },
      });

      return NextResponse.json(updatedMember);
    } else if (action === 'reject') {
      // Delete the member (rejecting the invitation)
      await prisma.organizationMember.delete({
        where: { id: memberId },
      });

      return NextResponse.json({ success: true });
    } else {
      // Leave the organization
      await prisma.organizationMember.delete({
        where: { id: memberId },
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error(`Error in POST /api/organization-members/[id]/action:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 