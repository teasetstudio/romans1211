// /home/mongdar/ephesians412/src/app/api/courses/[id]/defaultEventPlanItems/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";
import { AsyncIdParam } from "@/types/Params";

// GET /api/courses/[id]/defaultEventPlanItems - Get all default items for a course
export async function GET(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Check if the course exists and user has access
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: { hasSome: ORG_EDIT_PERMISSIONS }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    // Get all default event plan items for the course
    const items = await prisma.defaultEventPlanItem.findMany({
      where: { courseId },
      include: {
        preparations: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { order: "asc" }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching default event plan items:", error);
    return NextResponse.json(
      { error: "Failed to fetch default event plan items" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/defaultEventPlanItems - Create a new default item
export async function POST(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const data = await request.json();

    // Validate required fields
    if (!data.type || data.order === undefined) {
      return NextResponse.json(
        { error: "Type and order are required" },
        { status: 400 }
      );
    }

    // Check if the course exists and user has access
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: { hasSome: ORG_EDIT_PERMISSIONS }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    // Create the new default event plan item
    const newItem = await prisma.defaultEventPlanItem.create({
      data: {
        courseId,
        type: data.type,
        title: data.title,
        description: data.description,
        order: data.order,
        duration: data.duration,
        startHour: data.startHour,
        startMinute: data.startMinute,
        endHour: data.endHour,
        endMinute: data.endMinute,
        isReserve: data.isReserve || false,
        preparations: data.preparations && data.preparations.length > 0 ? {
          create: data.preparations.map((prep: any) => ({
            title: prep.title,
            order: prep.order
          }))
        } : undefined
      },
      include: {
        preparations: {
          orderBy: { order: "asc" }
        }
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating default event plan item:", error);
    return NextResponse.json(
      { error: "Failed to create default event plan item" },
      { status: 500 }
    );
  }
}
