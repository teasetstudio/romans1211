import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventPlanItemType } from "@prisma/client";
import { ORG_EDIT_PERMISSIONS } from "@/lib/permissions";
import { clampDayIndex, getDayCount } from "@/utils/eventDays";

interface IncomingPrep {
  title: string;
  order: number;
  isCompleted?: boolean;
  completedAt?: string | null;
  completedBy?: string | null;
}

interface IncomingItem {
  id?: string | null;
  type: string;
  title: string;
  order: number;
  eventId: string;
  description?: string | null;
  duration?: number | null;
  dayIndex?: number | null;
  startHour?: number | null;
  startMinute?: number | null;
  songId?: string | null;
  textId?: string | null;
  gameId?: string | null;
  isReserve?: boolean;
  preparations?: IncomingPrep[];
}

function buildItemData(item: IncomingItem, dayCount: number) {
  return {
    type: item.type.toUpperCase() as EventPlanItemType,
    title: item.title,
    description: item.description || null,
    duration: item.duration ?? null,
    order: item.order,
    dayIndex: clampDayIndex(item.dayIndex ?? 0, dayCount),
    startHour: item.startHour ?? null,
    startMinute: item.startMinute ?? null,
    songId: item.songId || null,
    textId: item.textId || null,
    gameId: item.gameId || null,
    isReserve: item.isReserve || false,
  };
}

type ExistingItem = {
  id: string;
  type: string;
  title: string | null;
  description: string | null;
  duration: number | null;
  order: number;
  dayIndex: number;
  startHour: number | null;
  startMinute: number | null;
  songId: string | null;
  textId: string | null;
  gameId: string | null;
  isReserve: boolean;
  preparations: Array<{
    id: string;
    title: string;
    order: number;
    isCompleted: boolean;
    completedAt: Date | null;
    completedBy: string | null;
  }>;
};

function hasItemFieldsChanged(
  itemData: ReturnType<typeof buildItemData>,
  existing: ExistingItem
): boolean {
  return (
    existing.type !== itemData.type ||
    existing.title !== itemData.title ||
    existing.description !== itemData.description ||
    existing.duration !== itemData.duration ||
    existing.order !== itemData.order ||
    existing.dayIndex !== itemData.dayIndex ||
    existing.startHour !== itemData.startHour ||
    existing.startMinute !== itemData.startMinute ||
    existing.songId !== itemData.songId ||
    existing.textId !== itemData.textId ||
    existing.gameId !== itemData.gameId ||
    existing.isReserve !== itemData.isReserve
  );
}

function havePrepsChanged(
  incoming: IncomingPrep[],
  existing: ExistingItem["preparations"]
): boolean {
  if (incoming.length !== existing.length) return true;
  const sortedIn = [...incoming].sort((a, b) => a.order - b.order);
  const sortedEx = [...existing].sort((a, b) => a.order - b.order);
  return sortedIn.some((p, i) => {
    const e = sortedEx[i];
    // completedAt: incoming is string | null, existing is Date | null — normalise to ISO string
    const inTs = p.completedAt ?? null;
    const exTs = e.completedAt?.toISOString() ?? null;
    return (
      p.title !== e.title ||
      p.order !== e.order ||
      (p.isCompleted ?? false) !== e.isCompleted ||
      (p.completedBy ?? null) !== e.completedBy ||
      inTs !== exTs
    );
  });
}

function mapPrep(prep: IncomingPrep) {
  return {
    title: prep.title,
    order: prep.order,
    isCompleted: prep.isCompleted ?? false,
    completedAt: prep.completedAt ? new Date(prep.completedAt) : null,
    completedBy: prep.completedBy ?? null,
  };
}

// POST /api/event-plan-items - Save plan items for an event (upsert/patch)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planItems, eventId } = await request.json();

    if (!Array.isArray(planItems)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Validate each item
    const orderSet = new Set();
    for (const item of planItems) {
      if (!item.title || item.order === undefined || !item.type || item.eventId !== eventId) {
        return NextResponse.json(
          { error: "Each item must have a title, order, type, and the same eventId" },
          { status: 400 }
        );
      }
      if (orderSet.has(item.order)) {
        return NextResponse.json(
          { error: "Order values must be unique" },
          { status: 400 }
        );
      }
      orderSet.add(item.order);

      if (item.dayIndex !== undefined && item.dayIndex !== null && (!Number.isInteger(item.dayIndex) || item.dayIndex < 0)) {
        return NextResponse.json(
          { error: "dayIndex must be a non-negative integer" },
          { status: 400 }
        );
      }
      if (item.startHour !== undefined && item.startHour !== null && (!Number.isInteger(item.startHour) || item.startHour < 0 || item.startHour > 23)) {
        return NextResponse.json(
          { error: "startHour must be an integer between 0 and 23" },
          { status: 400 }
        );
      }
      if (item.startMinute !== undefined && item.startMinute !== null && (!Number.isInteger(item.startMinute) || item.startMinute < 0 || item.startMinute > 59)) {
        return NextResponse.json(
          { error: "startMinute must be an integer between 0 and 59" },
          { status: 400 }
        );
      }

      // Validate preparations if they exist
      if (item.preparations && Array.isArray(item.preparations)) {
        const prepOrderSet = new Set();
        for (const prep of item.preparations) {
          if (!prep.title || prep.order === undefined) {
            return NextResponse.json(
              { error: "Each preparation must have a title and order" },
              { status: 400 }
            );
          }
          if (prepOrderSet.has(prep.order)) {
            return NextResponse.json(
              { error: "Preparation order values must be unique within each item" },
              { status: 400 }
            );
          }
          prepOrderSet.add(prep.order);
        }
      }
    }

    // Check if the event exists and user has access
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
              permissions: { hasSome: ORG_EDIT_PERMISSIONS }
            }
          }
        },
      },
      include: {
        organization: {
          include: {
            members: true
          }
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found or don't have permission" }, { status: 404 });
    }

    const dayCount = getDayCount(event);

    // Fetch existing plan items with their preparations
    const existingItems: ExistingItem[] = await prisma.eventPlanItem.findMany({
      where: { eventId },
      include: {
        preparations: true,
      },
      orderBy: { order: "asc" },
    });

    const existingById = new Map(existingItems.map(item => [item.id, item]));
    const existingIdSet = new Set(existingItems.map(i => i.id));

    // IDs from incoming payload that correspond to real DB rows
    const incomingIds = new Set(
      (planItems as IncomingItem[])
        .map(i => i.id)
        .filter((id): id is string => !!id && existingIdSet.has(id))
    );

    // Existing rows whose ID is absent from incoming → delete
    const idsToDelete = existingItems
      .filter(i => !incomingIds.has(i.id))
      .map(i => i.id);

    // Separate incoming into creates and updates
    const toCreate: IncomingItem[] = [];
    const toUpdate: Array<{ incoming: IncomingItem; existing: ExistingItem }> = [];

    for (const item of planItems as IncomingItem[]) {
      const existing = item.id ? existingById.get(item.id) : undefined;
      if (existing) {
        toUpdate.push({ incoming: item, existing });
      } else {
        toCreate.push(item);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Delete removed items (cascade deletes their preparations)
      if (idsToDelete.length > 0) {
        await tx.eventPlanItem.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      if (planItems.length === 0) return [];

      // Create new items in parallel
      const created = await Promise.all(
        toCreate.map(item => {
          const itemData = buildItemData(item, dayCount);
          return tx.eventPlanItem.create({
            data: {
              eventId,
              ...itemData,
              preparations: item.preparations?.length
                ? { create: item.preparations.map(mapPrep) }
                : undefined,
            },
            include: { preparations: { orderBy: { order: "asc" } } },
          });
        })
      );

      // Update existing items in parallel — skip if nothing changed
      const updated = await Promise.all(
        toUpdate.map(async ({ incoming, existing }) => {
          const itemData = buildItemData(incoming, dayCount);
          const fieldsChanged = hasItemFieldsChanged(itemData, existing);
          const incomingPreps = incoming.preparations ?? [];
          const prepsChanged = havePrepsChanged(incomingPreps, existing.preparations);

          // Nothing changed — zero queries
          if (!fieldsChanged && !prepsChanged) return existing;

          let finalPreparations = existing.preparations;

          if (prepsChanged) {
            await tx.preparationItem.deleteMany({
              where: { eventPlanItemId: existing.id },
            });
            if (incomingPreps.length > 0) {
              await tx.preparationItem.createMany({
                data: incomingPreps.map(p => ({
                  eventPlanItemId: existing.id,
                  ...mapPrep(p),
                })),
              });
            }
            // createMany doesn't return rows — fetch them for the response
            finalPreparations = await tx.preparationItem.findMany({
              where: { eventPlanItemId: existing.id },
              orderBy: { order: "asc" },
            });
          }

          if (!fieldsChanged) {
            // Only preparations changed — no UPDATE on the item itself needed
            return { ...existing, preparations: finalPreparations };
          }

          // Item fields changed — UPDATE (include re-reads preps from DB)
          return tx.eventPlanItem.update({
            where: { id: existing.id },
            data: itemData,
            include: { preparations: { orderBy: { order: "asc" } } },
          });
        })
      );

      return [...created, ...updated].sort((a, b) => a.order - b.order);
    }, { timeout: 30000 });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving event plan items:", error);
    return NextResponse.json(
      { error: "Failed to save event plan items" },
      { status: 500 }
    );
  }
}
