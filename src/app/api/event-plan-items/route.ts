import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventPlanItemType } from "@prisma/client";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";

// POST /api/event-plan-items - Create/Save a new plan item for an event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planItems, eventId } = await request.json();

    if (!Array.isArray(planItems)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Validate each item
    const orderSet = new Set();
    for (const item of planItems) {
      if (!item.title || item.order === undefined || !item.type || item.eventId !== eventId) {
        return NextResponse.json(
          { error: "Each item must have a title, order, type, and the same eventId" },
          { status: 400 }
        );
      }
      if (orderSet.has(item.order)) {
        return NextResponse.json(
          { error: "Order values must be unique" },
          { status: 400 }
        );
      }
      orderSet.add(item.order);
    }

    // Check if the event exists and user has access
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

    // Prepare data for createMany
    const dataToCreate = planItems.map(data => ({
      eventId,
      type: data.type.toUpperCase() as EventPlanItemType,
      title: data.title,
      description: data.description || null,
      duration: data.duration || 0,
      order: data.order,
      songId: data.songId || null,
      textId: data.textId || null,
      gameId: data.gameId || null,
      isReserve: data.isReserve || false,
    }));

    // Use transaction to ensure atomicity of delete and create operations
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing items for the event
      await tx.eventPlanItem.deleteMany({
        where: { eventId },
      });

      if (planItems.length === 0) {
        return [];
      }

      // Create new plan items
      const createdItems = await tx.eventPlanItem.createMany({
        data: dataToCreate,
      });

      return createdItems;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating event plan item:", error);
    return NextResponse.json(
      { error: "Failed to create event plan item" },
      { status: 500 }
    );
  }
}
