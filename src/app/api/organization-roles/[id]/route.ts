import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";

// Schema for updating an organization role
const updateOrganizationRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  permissions: z
    .array(
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
    )
    .optional(),
});

// PUT /api/organization-roles/[id]
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
    const validatedData = updateOrganizationRoleSchema.parse(json);

    // Check if role exists
    const role = await prisma.organizationRole.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Organization role not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: role.organizationId,
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
        { error: "No permission to update roles in this organization" },
        { status: 403 }
      );
    }

    // Check if new name already exists (if name is being updated)
    if (validatedData.name && validatedData.name !== role.name) {
      const existingRole = await prisma.organizationRole.findFirst({
        where: {
          organizationId: role.organizationId,
          name: validatedData.name,
        },
      });

      if (existingRole) {
        return NextResponse.json(
          { error: "Role with this name already exists in the organization" },
          { status: 400 }
        );
      }
    }

    const updatedRole = await prisma.organizationRole.update({
      where: { id },
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

    return NextResponse.json(updatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in PUT /api/organization-roles/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/organization-roles/[id]
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

    // Check if role exists
    const role = await prisma.organizationRole.findUnique({
      where: { id },
      include: {
        organization: true,
        members: true,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Organization role not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: role.organizationId,
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
        { error: "No permission to delete roles in this organization" },
        { status: 403 }
      );
    }

    // Check if role has members
    if (role.members.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete role that has members assigned" },
        { status: 400 }
      );
    }

    await prisma.organizationRole.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/organization-roles/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
