import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";

export type AsyncIdParam = Promise<{ id: string; itemId: string }>;

// PUT /api/courses/[id]/defaultEventPlanItems/[itemId] - Update a default item and its preparations
export async function PUT(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: courseId, itemId } = await params;
    const { preparations, ...itemData } = await request.json();
    // Verify the course exists and user has access
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
    // Use transaction to ensure atomicity
    const updatedItem = await prisma.$transaction(async (tx) => {
      // First, delete all existing preparations for this item
      await tx.defaultPreparationItem.deleteMany({
        where: { eventPlanItemId: itemId }
      });
      // Update the item
      const updatedItem = await tx.defaultEventPlanItem.update({
        where: {
          id: itemId,
          courseId
        },
        data: {
          ...itemData,
          // Create new preparations if provided
          preparations: preparations?.length > 0 ? {
            create: preparations.map((prep: any, index: number) => ({
              title: prep.title,
              order: prep.order,
              // Any other preparation fields
            }))
          } : undefined
        },
        include: {
          preparations: {
            orderBy: { order: 'asc' }
          }
        }
      });
      return updatedItem;
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating default event plan item:", error);
    return NextResponse.json(
      { error: "Failed to update default event plan item" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/defaultEventPlanItems/[itemId] - Delete a default item
export async function DELETE(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, itemId } = await params;

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

    // Check if the item exists and belongs to the course
    const existingItem = await prisma.defaultEventPlanItem.findFirst({
      where: {
        id: itemId,
        courseId
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Default event plan item not found" },
        { status: 404 }
      );
    }

    // Delete the item (preparations will be deleted due to cascade)
    await prisma.defaultEventPlanItem.delete({
      where: { id: itemId }
    });

    // Reorder remaining items
    const remainingItems = await prisma.defaultEventPlanItem.findMany({
      where: { courseId },
      orderBy: { order: "asc" }
    });

    // Update orders if needed
    const updatePromises = remainingItems.map((item, index) => {
      if (item.order !== index) {
        return prisma.defaultEventPlanItem.update({
          where: { id: item.id },
          data: { order: index }
        });
      }
      return Promise.resolve(null);
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting default event plan item:", error);
    return NextResponse.json(
      { error: "Failed to delete default event plan item" },
      { status: 500 }
    );
  }
}