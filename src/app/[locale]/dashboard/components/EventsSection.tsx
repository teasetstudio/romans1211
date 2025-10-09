import prisma from "@/lib/prisma";
import Link from "next/link";
import { ClientTime } from "@/components/ClientTime";

interface EventsSectionProps {
  organizationId: string;
}

export default async function EventsSection({ organizationId }: EventsSectionProps) {
  const now = new Date();

  const [futureCount, pastCount, upcomingEvents, closestUpcoming] = await Promise.all([
    prisma.event.count({
      where: { organizationId, isCancelled: false, startTime: { gte: now } },
    }),
    prisma.event.count({
      where: { organizationId, isCancelled: false, startTime: { lt: now } },
    }),
    prisma.event.findMany({
      where: { organizationId, isCancelled: false, startTime: { gte: now } },
      orderBy: { startTime: "asc" },
      take: 5,
      include: { course: true },
    }),
    prisma.event.findFirst({
      where: { organizationId, isCancelled: false, startTime: { gte: now } },
      orderBy: { startTime: "asc" },
      include: { course: true, eventPlanItems: true },
    }),
  ]);

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Events</h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
            Future: {futureCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
            Past: {pastCount}
          </span>
        </div>
      </div>

      {/* Closest upcoming event */}
      <div className="mb-4">
        {closestUpcoming ? (
          <Link href={`./dashboard/events/${closestUpcoming.id}`} className="block rounded-lg border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <span>Next up</span>
              {(() => {
                const now = new Date();
                const start = new Date(closestUpcoming.startTime);
                const diffMs = start.getTime() - now.getTime();
                if (diffMs > 0) {
                  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
                  const content = hours < 24
                    ? `in ${hours} hour${hours === 1 ? "" : "s"}`
                    : `in ${Math.ceil(hours / 24)} day${Math.ceil(hours / 24) === 1 ? "" : "s"}`;
                  return (
                    <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5">{content}</span>
                  );
                }
                return null;
              })()}
            </div>
            <div className="text-base font-semibold text-gray-900">{closestUpcoming.title}</div>
            <div className="text-sm text-gray-700 mt-1">
              <ClientTime date={closestUpcoming.startTime} formatStr="EEE, MMM d, HH:mm" /> — <ClientTime date={closestUpcoming.endTime} formatStr="HH:mm" />
              {closestUpcoming.course?.title ? ` · ${closestUpcoming.course.title}` : ""}
              {closestUpcoming.location ? ` · ${closestUpcoming.location}` : ""}
            </div>
            {/* Counts row */}
            {(() => {
              const items = closestUpcoming.eventPlanItems ?? [];
              const counts = items.reduce(
                (acc, it) => {
                  if (it.type === "SONG") acc.songs++;
                  else if (it.type === "TEXT") acc.texts++;
                  else if (it.type === "GAME") acc.games++;
                  else if (it.type === "CUSTOM") acc.comments++;
                  return acc;
                },
                { songs: 0, texts: 0, games: 0, comments: 0 }
              );
              return (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                  <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-1 border border-gray-200">Songs: {counts.songs}</span>
                  <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-1 border border-gray-200">Texts: {counts.texts}</span>
                  <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-1 border border-gray-200">Games: {counts.games}</span>
                  <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-1 border border-gray-200">Comments: {counts.comments}</span>
                </div>
              );
            })()}
            {closestUpcoming.description ? (
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">{closestUpcoming.description}</p>
            ) : null}
          </Link>
        ) : (
          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600 bg-white">No upcoming events</div>
        )}
      </div>

      {/* Upcoming list */}
      {upcomingEvents.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {upcomingEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <Link href={`./dashboard/events/${ev.id}`} className="hover:underline text-primary">{ev.title}</Link>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{ev.course?.title ?? "—"}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"><ClientTime date={ev.startTime} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
