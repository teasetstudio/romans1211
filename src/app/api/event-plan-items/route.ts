import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventPlanItemType } from "@prisma/client";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";
import { clampDayIndex, getDayCount } from "@/utils/eventDays";

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

      if (item.dayIndex !== undefined && item.dayIndex !== null && (!Number.isInteger(item.dayIndex) || item.dayIndex < 0)) {
        return NextResponse.json(
          { error: "dayIndex must be a non-negative integer" },
          { status: 400 }
        );
      }
      if (item.startHour !== undefined && item.startHour !== null && (!Number.isInteger(item.startHour) || item.startHour < 0 || item.startHour > 23)) {
        return NextResponse.json(
          { error: "startHour must be an integer between 0 and 23" },
          { status: 400 }
        );
      }
      if (item.startMinute !== undefined && item.startMinute !== null && (!Number.isInteger(item.startMinute) || item.startMinute < 0 || item.startMinute > 59)) {
        return NextResponse.json(
          { error: "startMinute must be an integer between 0 and 59" },
          { status: 400 }
        );
      }

      // Validate preparations if they exist
      if (item.preparations && Array.isArray(item.preparations)) {
        const prepOrderSet = new Set();
        for (const prep of item.preparations) {
          if (!prep.title || prep.order === undefined) {
            return NextResponse.json(
              { error: "Each preparation must have a title and order" },
              { status: 400 }
            );
          }
          if (prepOrderSet.has(prep.order)) {
            return NextResponse.json(
              { error: "Preparation order values must be unique within each item" },
              { status: 400 }
            );
          }
          prepOrderSet.add(prep.order);
        }
      }
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

    const dayCount = getDayCount(event);

    // Use transaction to ensure atomicity of delete and create operations
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing items for the event (this will cascade delete preparations)
      await tx.eventPlanItem.deleteMany({
        where: { eventId },
      });

      if (planItems.length === 0) {
        return [];
      }

      // Create new plan items with preparations
      const createdItems = [];
      for (const item of planItems) {
        const createdItem = await tx.eventPlanItem.create({
          data: {
            eventId,
            type: item.type.toUpperCase() as EventPlanItemType,
            title: item.title,
            description: item.description || null,
            duration: item.duration || 0,
            order: item.order,
            dayIndex: clampDayIndex(item.dayIndex, dayCount),
            startHour: item.startHour ?? null,
            startMinute: item.startMinute ?? null,
            songId: item.songId || null,
            textId: item.textId || null,
            gameId: item.gameId || null,
            isReserve: item.isReserve || false,
            preparations: item.preparations && item.preparations.length > 0 ? {
              create: item.preparations.map((prep: any) => ({
                title: prep.title,
                order: prep.order,
                isCompleted: prep.isCompleted || false,
                completedAt: prep.completedAt || null,
                completedBy: prep.completedBy || null,
              }))
            } : undefined
          },
          include: {
            preparations: {
              orderBy: { order: 'asc' }
            }
          }
        });
        createdItems.push(createdItem);
      }

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
