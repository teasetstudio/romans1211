import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ROUTE_DASHBOARD_COURSES, ROUTE_DASHBOARD_COURSE } from "@/res/routes";
import { getSession } from "@/lib/auth";
import { ORG_READ_PERMISSIONS } from "@/lib/permissions";
import CourseHeader from "../../components/course-header";
import MaterialUsageSummary from "./components/material-usage-summary";

interface EventCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CoursePage({ params }: EventCoursePageProps) {
  const { id } = await params;
  const session = await getSession();
  const course = await prisma.course.findUnique({
    where: {
      id,
      organization: {
        members: {
          some: {
            userId: session?.user?.id ?? '',
            permissions: {
              hasSome: ORG_READ_PERMISSIONS
            }
          }
        }
      }
    },
    include: {
      events: {
        orderBy: {
          startTime: 'desc'
        },
        include: {
          eventPlanItems: {
            select: {
              type: true,
              songId: true,
              textId: true,
              gameId: true,
              song: { select: { id: true, title: true } },
              text: { select: { id: true, title: true } },
              game: { select: { id: true, title: true } },
            }
          }
        }
      },
      organization: {
        include: {
          members: {
            where: {
              userId: session?.user?.id ?? ''
            },
          }
        }
      }
    }
  });

  if (!course) {
    redirect(ROUTE_DASHBOARD_COURSES);
  }

  return (
    <div>
      <CourseHeader course={course} backTo={ROUTE_DASHBOARD_COURSE(course.id)} />

      <div className="px-4">
        {(() => {
          // Totals
          const counts = course.events.reduce(
            (acc, ev) => {
              for (const item of ev.eventPlanItems ?? []) {
                if (item.type === 'CUSTOM') acc.custom += 1;
                if (item.type === 'SONG') acc.songs += 1;
                if (item.type === 'TEXT') acc.texts += 1;
                if (item.type === 'GAME') acc.games += 1;
              }
              return acc;
            },
            { songs: 0, texts: 0, games: 0, custom: 0 }
          );

          // Unique IDs across events (for unique counts)
          const songEventsMap = new Map<string, Set<string>>();
          const textEventsMap = new Map<string, Set<string>>();
          const gameEventsMap = new Map<string, Set<string>>();

          // Usage counts per material (for list with times used)
          const songUsage = new Map<string, { id: string; title: string; count: number; lastUsedAt: number }>();
          const textUsage = new Map<string, { id: string; title: string; count: number; lastUsedAt: number }>();
          const gameUsage = new Map<string, { id: string; title: string; count: number; lastUsedAt: number }>();

          // Per-usage event arrays (keep duplicates)
          const songUsages: { id: string; title: string; usedAt: number; eventTitle: string }[] = [];
          const textUsages: { id: string; title: string; usedAt: number; eventTitle: string }[] = [];
          const gameUsages: { id: string; title: string; usedAt: number; eventTitle: string }[] = [];

          for (const ev of course.events) {
            for (const item of ev.eventPlanItems ?? []) {
              if (item.songId) {
                if (!songEventsMap.has(item.songId)) songEventsMap.set(item.songId, new Set());
                songEventsMap.get(item.songId)!.add(ev.id);
                const t = item.song?.title ?? "Untitled";
                const rec = songUsage.get(item.songId) ?? { id: item.songId, title: t, count: 0, lastUsedAt: 0 };
                rec.count += 1;
                rec.title = rec.title || t;
                const usedAt = new Date(ev.startTime).getTime();
                if (usedAt > rec.lastUsedAt) rec.lastUsedAt = usedAt;
                songUsage.set(item.songId, rec);
                songUsages.push({ id: item.songId, title: t, usedAt, eventTitle: ev.title });
              }
              if (item.textId) {
                if (!textEventsMap.has(item.textId)) textEventsMap.set(item.textId, new Set());
                textEventsMap.get(item.textId)!.add(ev.id);
                const t = item.text?.title ?? "Untitled";
                const rec = textUsage.get(item.textId) ?? { id: item.textId, title: t, count: 0, lastUsedAt: 0 };
                rec.count += 1;
                rec.title = rec.title || t;
                const usedAt = new Date(ev.startTime).getTime();
                if (usedAt > rec.lastUsedAt) rec.lastUsedAt = usedAt;
                textUsage.set(item.textId, rec);
                textUsages.push({ id: item.textId, title: t, usedAt, eventTitle: ev.title });
              }
              if (item.gameId) {
                if (!gameEventsMap.has(item.gameId)) gameEventsMap.set(item.gameId, new Set());
                gameEventsMap.get(item.gameId)!.add(ev.id);
                const t = item.game?.title ?? "Untitled";
                const rec = gameUsage.get(item.gameId) ?? { id: item.gameId, title: t, count: 0, lastUsedAt: 0 };
                rec.count += 1;
                rec.title = rec.title || t;
                const usedAt = new Date(ev.startTime).getTime();
                if (usedAt > rec.lastUsedAt) rec.lastUsedAt = usedAt;
                gameUsage.set(item.gameId, rec);
                gameUsages.push({ id: item.gameId, title: t, usedAt, eventTitle: ev.title });
              }
            }
          }

          const uniqueCounts = {
            songs: songEventsMap.size,
            texts: textEventsMap.size,
            games: gameEventsMap.size,
          };

          return (
            <MaterialUsageSummary
              totals={counts}
              uniques={uniqueCounts}
              songs={Array.from(songUsage.values())}
              texts={Array.from(textUsage.values())}
              games={Array.from(gameUsage.values())}
              songEvents={songUsages}
              textEvents={textUsages}
              gameEvents={gameUsages}
            />
          );
        })()}
      </div>
    </div>
  );
}
