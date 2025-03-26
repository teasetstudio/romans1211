import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an event blueprint
const createEventBlueprintSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().nullable().optional().transform((str) => str ? new Date(str) : null),
  defaultDuration: z.number().int().min(1),
  location: z.string().optional(),
});

// GET /api/event-blueprints
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const courseId = searchParams.get("id");
    console.log("organizationId", organizationId)

    if (courseId) {
      // Get single event blueprint
      const course = await prisma.eventCourse.findUnique({
        where: { id: courseId },
        include: {
          events: true,
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
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(course);
    }

    // Get all blueprints for organization
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const courses = await prisma.eventCourse.findMany({
      where: {
        organizationId,
        // members: {
        //   some: {
        //     organizationMember: {
        //       user: { id: session.user.id },
        //     },
        //   },
        // },
      },
      // include: {
      //   events: true,
      //   members: {
      //     include: {
      //       organizationMember: {
      //         include: {
      //           user: {
      //             select: {
      //               id: true,
      //               name: true,
      //               email: true,
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error in GET /api/courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/event-blueprints
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    let json;
    try {
      json = await request.json();
      console.log('Received request payload:', json);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!json) {
      console.error('Request payload is null');
      return NextResponse.json({ error: 'Request payload is required' }, { status: 400 });
    }

    const validatedData = createEventBlueprintSchema.parse(json);

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

    // Create blueprint
    const blueprint = await prisma.eventCourse.create({
      data: {
        ...validatedData,
      //   members: {
      //     create: {
      //       role: "ADMIN",
      //       organizationMember: {
      //         connect: {
      //           userId_organizationId: {
      //             userId,
      //             organizationId: validatedData.organizationId,
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
      // include: {
      //   members: {
      //     include: {
      //       organizationMember: {
      //         include: {
      //           user: {
      //             select: {
      //               id: true,
      //               name: true,
      //               email: true,
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      },
    });

    return NextResponse.json(blueprint, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in POST /api/event-blueprints:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
