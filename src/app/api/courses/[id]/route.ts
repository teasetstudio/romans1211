import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";

// Schema for updating an event blueprint
const updateCoursesSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().nullable().transform((str) => str ? new Date(str) : null),
  defaultDuration: z.number().int().min(1),
  location: z.string().optional(),
});

// PUT /api/courses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const json = await request.json();
    const validatedData = updateCoursesSchema.parse(json);

    // Check if course exists and user has access
    const course = await prisma.eventCourse.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const updatedCourse = await prisma.eventCourse.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in PUT /api/courses/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if course exists and user has access
    const course = await prisma.eventCourse.findUnique({
      where: { id },
      // include: {
      //   members: {
      //     include: {
      //       organizationMember: {
      //         include: {
      //           user: true,
      //         },
      //       },
      //     },
      //   },
      // },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin member of the blueprint
    // const userMembership = blueprint.members.find(
    //   (member) =>
    //     member.organizationMember.user.email === session.user.email &&
    //     member.role === "ADMIN"
    // );

    // if (!userMembership) {
    //   return NextResponse.json(
    //     { error: "No permission to delete this event blueprint" },
    //     { status: 403 }
    //   );
    // }

    await prisma.eventCourse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/courses/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
