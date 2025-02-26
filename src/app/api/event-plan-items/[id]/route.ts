import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";

// Schema for updating an event plan item
const updateEventPlanItemSchema = z.object({
  type: z.enum(["SONG", "TEXT", "GAME", "COMMENT"]).optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  order: z.number().int().optional(),
  duration: z.number().int().optional().nullable(),
  startHour: z.number().int().min(0).max(23).optional().nullable(),
  startMinute: z.number().int().min(0).max(59).optional().nullable(),
  endHour: z.number().int().min(0).max(23).optional().nullable(),
  endMinute: z.number().int().min(0).max(59).optional().nullable(),
  songId: z.string().optional().nullable(),
  textId: z.string().optional().nullable(),
  gameId: z.string().optional().nullable(),
});

// PUT /api/event-plan-items/[id]
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
    const validatedData = updateEventPlanItemSchema.parse(json);

    // Check if item exists and user has access
    const item = await prisma.eventPlanItem.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            members: {
              include: {
                organizationMember: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Event plan item not found" },
        { status: 404 }
      );
    }

    // Check if user has access to the event
    const hasAccess = item.event.members.some(
      (member) => member.organizationMember.user.email === session.user.email
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to this event" },
        { status: 403 }
      );
    }

    // Update the item
    const updatedItem = await prisma.eventPlanItem.update({
      where: { id },
      data: validatedData,
      include: {
        song: true,
        text: true,
        game: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in PUT /api/event-plan-items/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-plan-items/[id]
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

    // Check if item exists and user has access
    const item = await prisma.eventPlanItem.findUnique({
      where: { id},
      include: {
        event: {
          include: {
            members: {
              include: {
                organizationMember: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Event plan item not found" },
        { status: 404 }
      );
    }

    // Check if user has access to the event
    const userMembership = item.event.members.find(
      (member) => member.organizationMember.user.email === session.user.email
    );

    if (!userMembership) {
      return NextResponse.json(
        { error: "No access to this event" },
        { status: 403 }
      );
    }

    // Only allow ADMIN or MANAGER to delete items
    if (!["ADMIN", "MANAGER"].includes(userMembership.role)) {
      return NextResponse.json(
        { error: "No permission to delete event plan items" },
        { status: 403 }
      );
    }

    await prisma.eventPlanItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/event-plan-items/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
