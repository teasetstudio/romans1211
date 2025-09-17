import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";

// Schema strictly for link access updates (slug is NOT accepted from client)
const linkAccessSchema = z.object({
  isAvailableByLink: z.boolean().optional(),
});

// PATCH /api/events/[id]/link-access
export async function PATCH(
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
    const { isAvailableByLink } = linkAccessSchema.parse(json);

    // Ensure event exists and the user has edit permissions in the org
    const event = await prisma.event.findUnique({
      where: {
        id,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: {
                hasSome: ORG_EDIT_PERMISSIONS,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or unauthorized" },
        { status: 404 }
      );
    }

    const data: Partial<{ isAvailableByLink: boolean; linkSlug: string }> = {};
    if (typeof isAvailableByLink === "boolean") data.isAvailableByLink = isAvailableByLink;
    // Always generate a slug automatically when enabling link access
    if (isAvailableByLink === true) {
      data.linkSlug = randomUUID();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.event.update({
      where: { id },
      data,
      select: {
        id: true,
        isAvailableByLink: true,
        linkSlug: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    const maybePrismaErr = error as { code?: string } | undefined;
    if (maybePrismaErr?.code === "P2002") {
      return NextResponse.json(
        { error: "Link slug already in use" },
        { status: 409 }
      );
    }
    console.error("Error in PATCH /api/events/[id]/link-access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
