import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an event blueprint member
const createEventBlueprintMemberSchema = z.object({
  blueprintId: z.string(),
  organizationMemberId: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "VIEWER"]),
});

// GET /api/event-blueprint-members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get("blueprintId");
    const memberId = searchParams.get("id");

    // Get single member
    if (memberId) {
      const member = await prisma.eventBlueprintMember.findUnique({
        where: { id: memberId },
        include: {
          blueprint: true,
          organizationMember: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              role: true,
            },
          },
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Event blueprint member not found" },
          { status: 404 }
        );
      }

      // Check if user has access to the blueprint
      const userMembership = await prisma.eventBlueprintMember.findFirst({
        where: {
          blueprintId: member.blueprintId,
          organizationMember: {
            user: { email: session.user.email },
          },
        },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "No access to this event blueprint" },
          { status: 403 }
        );
      }

      return NextResponse.json(member);
    }

    // List members for a blueprint
    if (!blueprintId) {
      return NextResponse.json(
        { error: "blueprintId is required" },
        { status: 400 }
      );
    }

    // Check if user has access to the blueprint
    const userMembership = await prisma.eventBlueprintMember.findFirst({
      where: {
        blueprintId,
        organizationMember: {
          user: { email: session.user.email },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No access to this event blueprint" },
        { status: 403 }
      );
    }

    const members = await prisma.eventBlueprintMember.findMany({
      where: { blueprintId },
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
            role: true,
          },
        },
      },
      orderBy: {
        organizationMember: {
          user: {
            name: "asc",
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error in GET /api/event-blueprint-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/event-blueprint-members
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = createEventBlueprintMemberSchema.parse(json);

    // Check if user is an admin of the blueprint
    const userMembership = await prisma.eventBlueprintMember.findFirst({
      where: {
        blueprintId: validatedData.blueprintId,
        role: "ADMIN",
        organizationMember: {
          user: { email: session.user.email },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to add members to this event blueprint" },
        { status: 403 }
      );
    }

    // Check if organization member exists and belongs to the same organization
    const orgMember = await prisma.organizationMember.findFirst({
      where: {
        id: validatedData.organizationMemberId,
        organizationId: {
          equals: (
            await prisma.eventBlueprint.findUnique({
              where: { id: validatedData.blueprintId },
              select: { organizationId: true },
            })
          )?.organizationId,
        },
      },
    });

    if (!orgMember) {
      return NextResponse.json(
        { error: "Invalid organization member" },
        { status: 400 }
      );
    }

    // Check if member is already added
    const existingMembership = await prisma.eventBlueprintMember.findUnique({
      where: {
        blueprintId_organizationMemberId: {
          blueprintId: validatedData.blueprintId,
          organizationMemberId: validatedData.organizationMemberId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Member is already added to this event blueprint" },
        { status: 400 }
      );
    }

    const member = await prisma.eventBlueprintMember.create({
      data: validatedData,
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
            role: true,
          },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in POST /api/event-blueprint-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
