import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";

// Schema for updating an event member
const updateEventMemberSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "VIEWER"]),
});

// PUT /api/event-members/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const json = await request.json();
    const validatedData = updateEventMemberSchema.parse(json);

    // Check if member exists
    const member = await prisma.eventMember.findUnique({
      where: { id },
      include: {
        event: true,
        organizationMember: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Event member not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin of the event
    const userMembership = await prisma.eventMember.findFirst({
      where: {
        eventId: member.eventId,
        role: "ADMIN",
        organizationMember: {
          user: { email: session.user.email },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to update members in this event" },
        { status: 403 }
      );
    }

    // Don't allow changing role of organization owner
    const organizationId = member.event.organizationId;
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (member.organizationMember.user.id === organization.ownerId) {
      return NextResponse.json(
        { error: "Cannot change role of organization owner" },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.eventMember.update({
      where: { id },
      data: validatedData,
      include: {
        organizationMember: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            role: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in PUT /api/event-members/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-members/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if member exists
    const member = await prisma.eventMember.findUnique({
      where: { id },
      include: {
        event: true,
        organizationMember: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Event member not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin of the event
    const userMembership = await prisma.eventMember.findFirst({
      where: {
        eventId: member.eventId,
        role: "ADMIN",
        organizationMember: {
          user: { email: session.user.email },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to remove members from this event" },
        { status: 403 }
      );
    }

    // Don't allow removing organization owner
    const organizationId = member.event.organizationId;
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (member.organizationMember.user.id === organization.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove organization owner" },
        { status: 400 }
      );
    }

    await prisma.eventMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/event-members/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
