import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventPlanItemType } from "@prisma/client";
import { AsyncIdParam } from "@/types/Params";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";

// PATCH /api/event-plan-items/[id] - Update a plan item
export async function PATCH(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const itemId = id;
    const data = await request.json();
    const eventId = data.eventId;

    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: { hasSome: ORG_EDIT_PERMISSIONS }
            }
          }
        },
      },
      include: {
        organization: {
          include: {
            members: true
          }
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if the plan item exists
    const existingItem = await prisma.eventPlanItem.findFirst({
      where: { 
        id: itemId,
        eventId: eventId 
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Plan item not found" }, { status: 404 });
    }

    // Update the plan item
    const updatedItem = await prisma.eventPlanItem.update({
      where: { id: itemId },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        duration: data.duration !== undefined ? data.duration : undefined,
        description: data.description !== undefined ? data.description : undefined,
        order: data.order !== undefined ? data.order : undefined,
        type: data.type !== undefined ? data.type as EventPlanItemType : undefined,
        songId: data.songId !== undefined ? data.songId : undefined,
        textId: data.textId !== undefined ? data.textId : undefined,
        gameId: data.gameId !== undefined ? data.gameId : undefined,
      },
      include: {
        song: true,
        text: true,
        game: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating event plan item:", error);
    return NextResponse.json(
      { error: "Failed to update event plan item" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-plan-items/[id] - Delete a plan item
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
    const itemId = id;

    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: "Provide eventId" }, { status: 400 });
    }

    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: { hasSome: ORG_EDIT_PERMISSIONS }
            }
          }
        },
       },
      include: {
        organization: {
          include: {
            members: true
          }
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found or don't have permission" }, { status: 404 });
    }

    // Check if the plan item exists
    const existingItem = await prisma.eventPlanItem.findFirst({
      where: { 
        id: itemId,
        eventId: eventId 
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Plan item not found" }, { status: 404 });
    }

    // Delete the plan item
    await prisma.eventPlanItem.delete({
      where: { id: itemId },
    });

    // Reorder remaining items to ensure no gaps in order
    const remainingItems = await prisma.eventPlanItem.findMany({
      where: { eventId },
      orderBy: { order: "asc" },
    });

    // Update orders if needed
    for (let i = 0; i < remainingItems.length; i++) {
      if (remainingItems[i].order !== i) {
        await prisma.eventPlanItem.update({
          where: { id: remainingItems[i].id },
          data: { order: i },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event plan item:", error);
    return NextResponse.json(
      { error: "Failed to delete event plan item" },
      { status: 500 }
    );
  }
}
