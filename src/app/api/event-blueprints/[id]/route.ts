import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";

// Schema for updating an event blueprint
const updateEventBlueprintSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  defaultDuration: z.number().int().min(1).optional(),
  location: z.string().optional().nullable(),
});

// PUT /api/event-blueprints/[id]
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
    const validatedData = updateEventBlueprintSchema.parse(json);

    // Check if blueprint exists and user has access
    const blueprint = await prisma.eventBlueprint.findUnique({
      where: { id },
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

    if (!blueprint) {
      return NextResponse.json(
        { error: "Event blueprint not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the blueprint
    const isMember = blueprint.members.some(
      (member) => member.organizationMember.user.email === session.user.email
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "No access to this event blueprint" },
        { status: 403 }
      );
    }

    const updatedBlueprint = await prisma.eventBlueprint.update({
      where: { id },
      data: validatedData,
      include: {
        events: true,
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
      },
    });

    return NextResponse.json(updatedBlueprint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in PUT /api/event-blueprints/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/event-blueprints/[id]
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

    // Check if blueprint exists and user has access
    const blueprint = await prisma.eventBlueprint.findUnique({
      where: { id },
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

    if (!blueprint) {
      return NextResponse.json(
        { error: "Event blueprint not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin member of the blueprint
    const userMembership = blueprint.members.find(
      (member) =>
        member.organizationMember.user.email === session.user.email &&
        member.role === "ADMIN"
    );

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to delete this event blueprint" },
        { status: 403 }
      );
    }

    await prisma.eventBlueprint.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/event-blueprints/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
