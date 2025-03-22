import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventPlanItemType } from "@prisma/client";
import { AsyncIdParam } from "@/types/Params";

// GET /api/event-plan-items - Get all plan items for an event
export async function GET(
  request: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the event exists and user has access
    // const event = await prisma.event.findUnique({
    //   where: { id: eventId },
    //   include: {
    //     members: {
    //       where: { userId: session.user.id },
    //     },
    //   },
    // });

    // if (!event) {
    //   return NextResponse.json({ error: "Event not found" }, { status: 404 });
    // }

    // if (event.members.length === 0) {
    //   // Check if user is a member of the organization
    //   const orgMember = await prisma.organizationMember.findFirst({
    //     where: {
    //       userId: session.user.id,
    //       organizationId: event.organizationId,
    //     },
    //   });

    //   if (!orgMember) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //   }
    // }

    // Get all plan items for the event
    const planItems = await prisma.eventPlanItem.findMany({
      where: { eventId: "asd" },
      include: {
        song: true,
        text: true,
        game: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(planItems);
  } catch (error) {
    console.error("Error fetching event plan items:", error);
    return NextResponse.json(
      { error: "Failed to fetch event plan items" },
      { status: 500 }
    );
  }
}

// POST /api/event-plan-items - Create a new plan item for an event
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
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete existing items for the event
    await prisma.eventPlanItem.deleteMany({
      where: { eventId },
    });

    if (planItems.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Prepare data for createMany
    const dataToCreate = planItems.map(data => ({
      eventId,
      type: data.type.toUpperCase() as EventPlanItemType,
      title: data.title,
      duration: data.duration || 0,
      order: data.order,
      songId: data.songId || null,
      textId: data.textId || null,
      gameId: data.gameId || null,
    }));

    // Create new plan items
    const createdItems = await prisma.eventPlanItem.createMany({
      data: dataToCreate,
    });

    return NextResponse.json(createdItems, { status: 201 });
  } catch (error) {
    console.error("Error creating event plan item:", error);
    return NextResponse.json(
      { error: "Failed to create event plan item" },
      { status: 500 }
    );
  }
}
