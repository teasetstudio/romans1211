import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an event plan item
const createEventPlanItemSchema = z.object({
  type: z.enum(["SONG", "TEXT", "GAME", "COMMENT"]),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int(),
  duration: z.number().int().optional(),
  startHour: z.number().int().min(0).max(23).optional(),
  startMinute: z.number().int().min(0).max(59).optional(),
  endHour: z.number().int().min(0).max(23).optional(),
  endMinute: z.number().int().min(0).max(59).optional(),
  songId: z.string().optional(),
  textId: z.string().optional(),
  gameId: z.string().optional(),
  eventId: z.string(),
});

// GET /api/event-plan-items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const itemId = searchParams.get("id");

    // Get single item
    if (itemId) {
      const item = await prisma.eventPlanItem.findUnique({
        where: { id: itemId },
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
          song: true,
          text: true,
          game: true,
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

      return NextResponse.json(item);
    }

    // List items for an event
    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    // Check if user has access to the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const hasAccess = event.members.some(
      (member) => member.organizationMember.user.email === session.user.email
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to this event" },
        { status: 403 }
      );
    }

    const items = await prisma.eventPlanItem.findMany({
      where: { eventId },
      include: {
        song: true,
        text: true,
        game: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in GET /api/event-plan-items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/event-plan-items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = createEventPlanItemSchema.parse(json);

    // Check if user has access to the event
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
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
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const hasAccess = event.members.some(
      (member) => member.organizationMember.user.email === session.user.email
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to this event" },
        { status: 403 }
      );
    }

    // Create the event plan item
    const item = await prisma.eventPlanItem.create({
      data: validatedData,
      include: {
        song: true,
        text: true,
        game: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in POST /api/event-plan-items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
