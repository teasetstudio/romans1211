import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an event member
const createEventMemberSchema = z.object({
  eventId: z.string(),
  organizationMemberId: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "VIEWER"]),
});

// GET /api/event-members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const memberId = searchParams.get("id");

    // Get single member
    if (memberId) {
      const member = await prisma.eventMember.findUnique({
        where: { id: memberId },
        include: {
          event: true,
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

      if (!member) {
        return NextResponse.json(
          { error: "Event member not found" },
          { status: 404 }
        );
      }

      // Check if user has access to the event
      const userMembership = await prisma.eventMember.findFirst({
        where: {
          eventId: member.eventId,
          organizationMember: {
            user: { email: session.user.email },
          },
        },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "No access to this event" },
          { status: 403 }
        );
      }

      return NextResponse.json(member);
    }

    // List members for an event
    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    // Check if user has access to the event
    const userMembership = await prisma.eventMember.findFirst({
      where: {
        eventId,
        organizationMember: {
          user: { email: session.user.email },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No access to this event" },
        { status: 403 }
      );
    }

    const members = await prisma.eventMember.findMany({
      where: { eventId },
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
      orderBy: {
        organizationMember: {
          user: {
            name: "asc",
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error in GET /api/event-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/event-members
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = createEventMemberSchema.parse(json);

    // Check if user is an admin of the event
    const userMembership = await prisma.eventMember.findFirst({
      where: {
        eventId: validatedData.eventId,
        role: "ADMIN",
        organizationMember: {
          user: { email: session.user.email },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to add members to this event" },
        { status: 403 }
      );
    }

    // Check if organization member exists and belongs to the same organization
    const orgMember = await prisma.organizationMember.findFirst({
      where: {
        id: validatedData.organizationMemberId,
        organizationId: {
          equals: (
            await prisma.event.findUnique({
              where: { id: validatedData.eventId },
              select: { organizationId: true },
            })
          )?.organizationId,
        },
      },
    });

    if (!orgMember) {
      return NextResponse.json(
        { error: "Invalid organization member" },
        { status: 400 }
      );
    }

    // Check if member is already added
    const existingMembership = await prisma.eventMember.findUnique({
      where: {
        eventId_organizationMemberId: {
          eventId: validatedData.eventId,
          organizationMemberId: validatedData.organizationMemberId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Member is already added to this event" },
        { status: 400 }
      );
    }

    const member = await prisma.eventMember.create({
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

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in POST /api/event-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
