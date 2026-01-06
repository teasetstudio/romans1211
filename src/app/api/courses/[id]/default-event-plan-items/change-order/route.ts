
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";
import { AsyncIdParam } from "@/types/Params";

export async function PATCH(
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

    const itemId = data?.itemId as string | undefined;
    const direction = data?.direction as "up" | "down" | undefined;

    if (!itemId || (direction !== "up" && direction !== "down")) {
      return NextResponse.json(
        { error: "itemId and direction ('up'|'down') are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: { hasSome: ORG_EDIT_PERMISSIONS },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    const current = await prisma.defaultEventPlanItem.findFirst({
      where: { id: itemId, courseId },
      select: { id: true, order: true },
    });

    if (!current) {
      return NextResponse.json(
        { error: "Default event plan item not found" },
        { status: 404 }
      );
    }

    const neighbor = await prisma.defaultEventPlanItem.findFirst({
      where:
        direction === "up"
          ? { courseId, order: { lt: current.order } }
          : { courseId, order: { gt: current.order } },
      orderBy: { order: direction === "up" ? "desc" : "asc" },
      select: { id: true, order: true },
    });

    if (!neighbor) {
      const items = await prisma.defaultEventPlanItem.findMany({
        where: { courseId },
        include: {
          preparations: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });

      return NextResponse.json({ items });
    }

    await prisma.$transaction(async (tx) => {
      await tx.defaultEventPlanItem.update({
        where: { id: current.id },
        data: { order: neighbor.order },
      });

      await tx.defaultEventPlanItem.update({
        where: { id: neighbor.id },
        data: { order: current.order },
      });
    });

    const items = await prisma.defaultEventPlanItem.findMany({
      where: { courseId },
      include: {
        preparations: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error changing default event plan item order:", error);
    return NextResponse.json(
      { error: "Failed to change default event plan item order" },
      { status: 500 }
    );
  }
}

