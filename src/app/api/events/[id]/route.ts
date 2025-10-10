import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AsyncIdParam } from "@/types/Params";
import { ORG_DELETE_PERMISSIONS, ORG_EDIT_PERMISSIONS } from "@/lib/permissions";

// Schema for updating an event
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startTime: z.string().transform((str) => new Date(str)).optional(),
  endTime: z.string().transform((str) => new Date(str)).optional(),
  location: z.string().optional().nullable(),
  isCancelled: z.boolean().optional(),
  eventPlanItems: z
    .array(
      z.object({
        id: z.string().optional(), // Existing item ID
        type: z.enum(["SONG", "TEXT", "GAME", "COMMENT"]),
        title: z.string().optional(),
        description: z.string().optional(),
        order: z.number().int(),
        duration: z.number().int().optional(),
        startHour: z.number().int().min(0).max(23).optional(),
        startMinute: z.number().int().min(0).max(59).optional(),
        endHour: z.number().int().min(0).max(23).optional(),
        endMinute: z.number().int().min(0).max(59).optional(),
        songId: z.string().optional(),
        textId: z.string().optional(),
        gameId: z.string().optional(),
        preparations: z
          .array(
            z.object({
              id: z.string().optional(), // Existing preparation ID
              title: z.string(),
              order: z.number().int(),
              isCompleted: z.boolean().optional(),
              completedAt: z.string().transform((str) => str ? new Date(str) : null).optional(),
              completedBy: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

// PUT /api/events/[id]
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
    const validatedData = updateEventSchema.parse(json);

    // Check if event exists and user has access
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
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
        eventPlanItems: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Update event and handle plan items if provided
    const updateData = {
      ...validatedData,
      eventPlanItems: undefined, // Handle plan items separately
    };

    if (validatedData.eventPlanItems) {
      // Use transaction to handle event plan items and preparations
      await prisma.$transaction(async (tx) => {
        // Delete existing items not in the update (this will cascade delete preparations)
        const existingItemIds = event.eventPlanItems.map((item) => item.id);
        const updatedItemIds = validatedData.eventPlanItems!
          .filter((item) => item.id)
          .map((item) => item.id as string);
        
        const itemsToDelete = existingItemIds.filter(
          (id) => !updatedItemIds.includes(id)
        );

        if (itemsToDelete.length > 0) {
          await tx.eventPlanItem.deleteMany({
            where: { id: { in: itemsToDelete } },
          });
        }

        // Update existing items and create new ones
        for (const item of validatedData.eventPlanItems!) {
          const { preparations, ...itemData } = item;
          
          if (item.id) {
            // Update existing item
            await tx.eventPlanItem.update({
              where: { id: item.id },
              data: {
                type: itemData.type,
                title: itemData.title,
                description: itemData.description,
                order: itemData.order,
                duration: itemData.duration,
                startHour: itemData.startHour,
                startMinute: itemData.startMinute,
                endHour: itemData.endHour,
                endMinute: itemData.endMinute,
                songId: itemData.songId,
                textId: itemData.textId,
                gameId: itemData.gameId,
              },
            });

            // Handle preparations for existing item
            if (preparations) {
              // Delete existing preparations not in the update
              const existingPreparations = await tx.preparationItem.findMany({
                where: { eventPlanItemId: item.id },
                select: { id: true }
              });
              
              const existingPrepIds = existingPreparations.map(p => p.id);
              const updatedPrepIds = preparations
                .filter(prep => prep.id)
                .map(prep => prep.id as string);
              
              const prepsToDelete = existingPrepIds.filter(
                id => !updatedPrepIds.includes(id)
              );

              if (prepsToDelete.length > 0) {
                await tx.preparationItem.deleteMany({
                  where: { id: { in: prepsToDelete } }
                });
              }

              // Update existing preparations and create new ones
              for (const prep of preparations) {
                if (prep.id) {
                  await tx.preparationItem.update({
                    where: { id: prep.id },
                    data: {
                      title: prep.title,
                      order: prep.order,
                      isCompleted: prep.isCompleted ?? false,
                      completedAt: prep.completedAt || null,
                      completedBy: prep.completedBy || null,
                    }
                  });
                } else {
                  await tx.preparationItem.create({
                    data: {
                      title: prep.title,
                      order: prep.order,
                      isCompleted: prep.isCompleted ?? false,
                      completedAt: prep.completedAt || null,
                      completedBy: prep.completedBy || null,
                      eventPlanItemId: item.id,
                    }
                  });
                }
              }
            }
          } else {
            // Create new item with preparations
            await tx.eventPlanItem.create({
              data: {
                eventId: id,
                type: itemData.type,
                title: itemData.title,
                description: itemData.description,
                order: itemData.order,
                duration: itemData.duration,
                startHour: itemData.startHour,
                startMinute: itemData.startMinute,
                endHour: itemData.endHour,
                endMinute: itemData.endMinute,
                songId: itemData.songId,
                textId: itemData.textId,
                gameId: itemData.gameId,
                preparations: preparations && preparations.length > 0 ? {
                  create: preparations.map(prep => ({
                    title: prep.title,
                    order: prep.order,
                    isCompleted: prep.isCompleted ?? false,
                    completedAt: prep.completedAt || null,
                    completedBy: prep.completedBy || null,
                  }))
                } : undefined
              }
            });
          }
        }
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        course: true,
        eventPlanItems: {
          include: {
            song: true,
            text: true,
            game: true,
            preparations: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error in PUT /api/events/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
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

    // Check if event exists and user has access
    const event = await prisma.event.findUnique({
      where: {
        id,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: {
                hasSome: ORG_DELETE_PERMISSIONS,
              },
            },
          },
        },
      },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });


    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/events/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
