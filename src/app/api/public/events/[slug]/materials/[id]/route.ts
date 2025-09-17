import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/public/events/[slug]/materials/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;

    // 1) Find public-accessible event by slug
    const event = await prisma.event.findFirst({
      where: {
        linkSlug: slug,
        isAvailableByLink: true,
      },
      select: {
        id: true,
        eventPlanItems: {
          select: {
            songId: true,
            textId: true,
            gameId: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found or not available by link" }, { status: 404 });
    }

    // 2) Determine requested material type and its translation group root (originalId or self id)
    // Try resolving as Text, then Song, then Game
    let matType: "song" | "text" | "game" | null = null;
    let groupRootId: string | null = null;

    const requestedText = await prisma.text.findUnique({ where: { id }, select: { id: true, originalId: true } });
    if (requestedText) {
      matType = "text";
      groupRootId = requestedText.originalId ?? requestedText.id;
    }

    if (!matType) {
      const requestedSong = await prisma.song.findUnique({ where: { id }, select: { id: true, originalId: true } });
      if (requestedSong) {
        matType = "song";
        groupRootId = requestedSong.originalId ?? requestedSong.id;
      }
    }

    if (!matType) {
      const requestedGame = await prisma.game.findUnique({ where: { id }, select: { id: true, originalId: true } });
      if (requestedGame) {
        matType = "game";
        groupRootId = requestedGame.originalId ?? requestedGame.id;
      }
    }

    if (!matType || !groupRootId) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // 3) Authorize: ensure the event references any material in the same translation group
    let authorized = false;
    if (matType === "text") {
      const link = await prisma.eventPlanItem.findFirst({
        where: {
          eventId: event.id,
          text: { OR: [{ id: groupRootId }, { originalId: groupRootId }] },
        },
        select: { id: true },
      });
      authorized = !!link;
    } else if (matType === "song") {
      const link = await prisma.eventPlanItem.findFirst({
        where: {
          eventId: event.id,
          song: { OR: [{ id: groupRootId }, { originalId: groupRootId }] },
        },
        select: { id: true },
      });
      authorized = !!link;
    } else if (matType === "game") {
      const link = await prisma.eventPlanItem.findFirst({
        where: {
          eventId: event.id,
          game: { OR: [{ id: groupRootId }, { originalId: groupRootId }] },
        },
        select: { id: true },
      });
      authorized = !!link;
    }

    if (!authorized) {
      return NextResponse.json({ error: "Material not found in this event" }, { status: 404 });
    }

    // 3) Fetch material by type with tags and translations in a compatible shape
    if (matType === "text") {
      const text = await prisma.text.findUnique({
        where: { id },
        include: {
          tags: true,
          translations: true,
          original: { include: { translations: true } },
        },
      });
      if (!text) return NextResponse.json({ error: "Material not found" }, { status: 404 });
      return NextResponse.json({ ...text, type: "text" });
    }

    if (matType === "song") {
      const song = await prisma.song.findUnique({
        where: { id },
        include: {
          tags: true,
          translations: true,
          original: { include: { translations: true } },
        },
      });
      if (!song) return NextResponse.json({ error: "Material not found" }, { status: 404 });
      return NextResponse.json({ ...song, type: "song" });
    }

    if (matType === "game") {
      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          tags: true,
          translations: true,
          original: { include: { translations: true } },
        },
      });
      if (!game) return NextResponse.json({ error: "Material not found" }, { status: 404 });
      return NextResponse.json({ ...game, type: "game" });
    }

    return NextResponse.json({ error: "Unsupported material type" }, { status: 400 });
  } catch (error) {
    console.error("Error in GET /api/public/events/[slug]/materials/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
