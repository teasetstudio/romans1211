import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ORG_CREATE_PERMISSIONS, ORG_READ_PERMISSIONS } from "@/lib/permissions";

// Schema for creating an event blueprint
const createEventBlueprintSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().nullable().optional().transform((str) => str ? new Date(str) : null),
  location: z.string().optional(),
});

// GET /api/courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const courseId = searchParams.get("id");

    if (courseId) {
      // Get single course
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
          organization: {
            members: {
              some: {
                userId: session.user.id,
                permissions: { hasSome: ORG_READ_PERMISSIONS }
              }
            }
          },
        },
        include: {
          events: true,
          organization: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found or unauthorized" },
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

    const hasReadPermission = await prisma.organizationMember.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
        permissions: { hasSome: ORG_READ_PERMISSIONS }
      },
    });

    if (!hasReadPermission) {
      return NextResponse.json(
        { error: "No access to this organization" },
        { status: 403 }
      );
    }

    const courses = await prisma.course.findMany({
      where: { organizationId },
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

// POST /api/courses
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
    const hasCreatePermission = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        userId: userId,
        permissions: { hasSome: ORG_CREATE_PERMISSIONS }
      },
    });

    // check if user is the owner of the organization
    const organization = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId, ownerId: userId },
    });

    if (!hasCreatePermission && !organization) {
      return NextResponse.json(
        { error: "No access to this organization" },
        { status: 403 }
      );
    }

    // Create blueprint
    const blueprint = await prisma.course.create({
      data: validatedData,
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
