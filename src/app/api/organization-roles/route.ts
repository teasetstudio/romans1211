import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an organization role
const createOrganizationRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string(),
  permissions: z.array(
    z.enum([
      "ADMIN",
      "ADMIN_LIBRARY",
      "MANAGE_LIBRARY",
      "EDIT_LIBRARY",
      "VIEW_LIBRARY",
      "ADMIN_EVENT_BLUEPRINTS",
      "MANAGE_EVENT_BLUEPRINTS",
      "EDIT_EVENT_BLUEPRINTS",
      "VIEW_EVENT_BLUEPRINTS",
    ])
  ),
});

// GET /api/organization-roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const roleId = searchParams.get("id");

    // Get single role
    if (roleId) {
      const role = await prisma.organizationRole.findUnique({
        where: { id: roleId },
        include: {
          organization: true,
          members: {
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
      });

      if (!role) {
        return NextResponse.json(
          { error: "Organization role not found" },
          { status: 404 }
        );
      }

      // Check if user has access to the organization
      const userMembership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: role.organizationId,
          user: { email: session.user.email },
        },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "No access to this organization" },
          { status: 403 }
        );
      }

      return NextResponse.json(role);
    }

    // List roles for an organization
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Check if user has access to the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email: session.user.email },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No access to this organization" },
        { status: 403 }
      );
    }

    const roles = await prisma.organizationRole.findMany({
      where: { organizationId },
      include: {
        members: {
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
      orderBy: { name: "asc" },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error in GET /api/organization-roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/organization-roles
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = createOrganizationRoleSchema.parse(json);

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        user: { email: session.user.email },
        role: {
          permissions: {
            has: "ADMIN",
          },
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to create roles in this organization" },
        { status: 403 }
      );
    }

    // Check if role name already exists in the organization
    const existingRole = await prisma.organizationRole.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        name: validatedData.name,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Role with this name already exists in the organization" },
        { status: 400 }
      );
    }

    const role = await prisma.organizationRole.create({
      data: validatedData,
      include: {
        members: {
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
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in POST /api/organization-roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
