import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from '@prisma/client';

// Schema for creating an event
const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  organizationId: z.string(),
  courseId: z.string().optional(),
  // eventPlanItems: z
  //   .array(
  //     z.object({
  //       type: z.enum(["SONG", "TEXT", "GAME", "COMMENT"]),
  //       title: z.string().optional(),
  //       description: z.string().optional(),
  //       order: z.number().int(),
  //       duration: z.number().int().optional(),
  //       startHour: z.number().int().min(0).max(23).optional(),
  //       startMinute: z.number().int().min(0).max(59).optional(),
  //       endHour: z.number().int().min(0).max(23).optional(),
  //       endMinute: z.number().int().min(0).max(59).optional(),
  //       songId: z.string().optional(),
  //       textId: z.string().optional(),
  //       gameId: z.string().optional(),
  //     })
  //   )
  //   .optional(),
});

// GET /api/events
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const eventId = searchParams.get("id");
    const courseId = searchParams.get("courseId");
    const startFrom = searchParams.get("startFrom");
    const startTo = searchParams.get("startTo");

    // Get single event
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          course: true,
          members: {
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
                },
              },
            },
          },
          eventPlanItems: {
            include: {
              song: true,
              text: true,
              game: true,
            },
            orderBy: {
              order: "asc",
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

      return NextResponse.json(event);
    }

    // List events with filters
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const where: Prisma.EventWhereInput = { organizationId };
    
    if (courseId) {
      where.courseId = courseId;
    }

    if (startFrom || startTo) {
      where.startTime = {};
      if (startFrom) {
        where.startTime.gte = new Date(startFrom);
      }
      if (startTo) {
        where.startTime.lte = new Date(startTo);
      }
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        course: true,
        members: {
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
              },
            },
          },
        },
        eventPlanItems: {
          include: {
            song: true,
            text: true,
            game: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error in GET /api/events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const json = await request.json();
    const validatedData = createEventSchema.parse(json);

    // Check if user has access to the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        user: { id: userId },
      },
    });

    // check if user is the owner of the organization
    const organization = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId, ownerId: userId },
    });

    if (!userMembership && !organization) {
      return NextResponse.json(
        { error: "No access to this organization" },
        { status: 403 }
      );
    }

    // Get all default event plan items for the course
    const defaultEventPlanItems = await prisma.defaultEventPlanItem.findMany({
      where: { courseId: validatedData.courseId },
      include: {
        preparations: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { order: "asc" }
    });

    // Create event with plan items if provided
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        location: validatedData.location,
        organizationId: validatedData.organizationId,
        courseId: validatedData.courseId,
        // members: {
        //   create: {
        //     organizationMemberId: userMembership.id,
        //     role: "ADMIN",
        //   },
        // },
        eventPlanItems: {
          create: [
            ...(defaultEventPlanItems || []).map(item => ({
              type: item.type,
              title: item.title,
              description: item.description,
              order: item.order,
              preparations: item.preparations?.length > 0 ? {
                create: item.preparations.map(prep => ({
                  title: prep.title,
                  order: prep.order,
                }))
              } : undefined
            })),
          ]
        }
      },
      include: {
        course: true,
        // members: {
        //   include: {
        //     organizationMember: {
        //       include: {
        //         user: {
        //           select: {
        //             id: true,
        //             name: true,
        //             email: true,
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
        eventPlanItems: {
          include: {
            song: true,
            text: true,
            game: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in POST /api/events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
