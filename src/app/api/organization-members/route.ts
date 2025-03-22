import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an organization member
const createOrganizationMemberSchema = z.object({
  organizationId: z.string(),
  email: z.string().email(),
  permissions: z.array(z.enum([
    "ADMIN", 
    "MANAGE", 
    "EDIT", 
    "VIEW", 
    "ADMIN_LIBRARY", 
    "MANAGE_LIBRARY", 
    "EDIT_LIBRARY", 
    "VIEW_LIBRARY", 
    "ADMIN_EVENT_COURSES", 
    "MANAGE_EVENT_COURSES", 
    "EDIT_EVENT_COURSES", 
    "VIEW_EVENT_COURSES"
  ])),
});

// GET /api/organization-members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const memberId = searchParams.get("id");

    // Get single member
    if (memberId) {
      const member = await prisma.organizationMember.findUnique({
        where: { id: memberId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: true,
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Organization member not found" },
          { status: 404 }
        );
      }

      // Check if user has access to the organization
      const userMembership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: member.organizationId,
          user: { email: session.user.email },
          permissions: { has: "ADMIN" },
        },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "No access to this organization" },
          { status: 403 }
        );
      }

      return NextResponse.json(member);
    }

    // List members for an organization
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

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error in GET /api/organization-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/organization-members
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = createOrganizationMemberSchema.parse(json);

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        permissions: { has: "ADMIN" },
        user: { email: session.user.email },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to add members to this organization" },
        { status: 403 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if member is already added
    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: validatedData.organizationId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    const member = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: validatedData.organizationId,
        permissions: validatedData.permissions,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        organization: true,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in POST /api/organization-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/organization-members/:id
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = request.url.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const json = await request.json();
    const { permissions } = json;

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: "Invalid permissions" }, { status: 400 });
    }

    // Get the member to update
    const memberToUpdate = await prisma.organizationMember.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!memberToUpdate) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: memberToUpdate.organizationId,
        permissions: { has: "ADMIN" },
        user: { email: session.user.email },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to update members in this organization" },
        { status: 403 }
      );
    }

    const updatedMember = await prisma.organizationMember.update({
      where: { id },
      data: { permissions },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        organization: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error in PATCH /api/organization-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/organization-members/:id
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = request.url.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Get the member to delete
    const memberToDelete = await prisma.organizationMember.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!memberToDelete) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if user is an admin of the organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: memberToDelete.organizationId,
        permissions: { has: "ADMIN" },
        user: { email: session.user.email },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "No permission to remove members from this organization" },
        { status: 403 }
      );
    }

    // Prevent removing the last admin
    if (memberToDelete.permissions.includes("ADMIN")) {
      const adminCount = await prisma.organizationMember.count({
        where: {
          organizationId: memberToDelete.organizationId,
          permissions: { has: "ADMIN" },
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin of the organization" },
          { status: 400 }
        );
      }
    }

    await prisma.organizationMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/organization-members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 