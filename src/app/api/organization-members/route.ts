import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating an organization member
const createOrganizationMemberSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  roleId: z.string(),
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
          role: true,
          blueprintRoles: true,
          eventRoles: true,
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
        role: true,
        blueprintRoles: true,
        eventRoles: true,
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
        { error: "No permission to add members to this organization" },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if role exists and belongs to the organization
    const role = await prisma.organizationRole.findFirst({
      where: {
        id: validatedData.roleId,
        organizationId: validatedData.organizationId,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Invalid role for this organization" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        userId: validatedData.userId,
        organizationId: validatedData.organizationId,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    const member = await prisma.organizationMember.create({
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
