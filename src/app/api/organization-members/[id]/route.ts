import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";

// Schema for updating an organization member
const updateOrganizationMemberSchema = z.object({
  roleId: z.string(),
});

// PUT /api/organization-members/[id]
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
    const validatedData = updateOrganizationMemberSchema.parse(json);

    // Check if member exists
    const member = await prisma.organizationMember.findUnique({
      where: { id },
      include: {
        organization: true,
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Organization member not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: member.organizationId,
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
        { error: "No permission to update members in this organization" },
        { status: 403 }
      );
    }

    // Check if role exists and belongs to the organization
    const role = await prisma.organizationRole.findFirst({
      where: {
        id: validatedData.roleId,
        organizationId: member.organizationId,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Invalid role for this organization" },
        { status: 400 }
      );
    }

    // Don't allow changing role of organization owner
    if (member.user.id === member.organization.ownerId) {
      return NextResponse.json(
        { error: "Cannot change role of organization owner" },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.organizationMember.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: true,
        blueprintRoles: true,
        eventRoles: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in PUT /api/organization-members/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/organization-members/[id]
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

    // Check if member exists
    const member = await prisma.organizationMember.findUnique({
      where: { id },
      include: {
        organization: true,
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Organization member not found" },
        { status: 404 }
      );
    }

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: member.organizationId,
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
        { error: "No permission to remove members from this organization" },
        { status: 403 }
      );
    }

    // Don't allow removing organization owner
    if (member.user.id === member.organization.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove organization owner" },
        { status: 400 }
      );
    }

    // Remove member from all blueprints and events
    await prisma.$transaction([
      prisma.eventBlueprintMember.deleteMany({
        where: { organizationMemberId: id },
      }),
      prisma.eventMember.deleteMany({
        where: { organizationMemberId: id },
      }),
      prisma.organizationMember.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/organization-members/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
