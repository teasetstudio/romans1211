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
  endDate: z.string().transform((str) => new Date(str)).optional(),
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
    const blueprintId = searchParams.get("id");

    if (blueprintId) {
      // Get single event blueprint
      const blueprint = await prisma.eventBlueprint.findUnique({
        where: { id: blueprintId },
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

      if (!blueprint) {
        return NextResponse.json(
          { error: "Event blueprint not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(blueprint);
    }

    // List event blueprints for an organization
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const blueprints = await prisma.eventBlueprint.findMany({
      where: { organizationId },
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
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(blueprints);
  } catch (error) {
    console.error("Error in GET /api/event-blueprints:", error);
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

    const json = await request.json();
    const validatedData = createEventBlueprintSchema.parse(json);

    // Check if user has access to the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        user: { email: session.user.email },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No access to this organization" },
        { status: 403 }
      );
    }

    const blueprint = await prisma.eventBlueprint.create({
      data: {
        ...validatedData,
        members: {
          create: {
            organizationMemberId: userMembership.id,
            role: "ADMIN",
          },
        },
      },
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
