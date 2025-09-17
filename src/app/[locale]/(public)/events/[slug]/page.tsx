import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PublicEventView from "./components/PublicEventView";

export default async function PublicEventPage({ params }: { params: { slug: string; locale: string } }) {
  const { slug } = await params;

  // Fetch event by linkSlug with public flag
  const event = await prisma.event.findFirst({
    where: {
      linkSlug: slug,
      isAvailableByLink: true,
    },
    include: {
      course: true,
      eventPlanItems: {
        include: {
          song: true,
          text: true,
          game: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
          {event.description && (
            <p className="mt-1 text-sm text-gray-600">{event.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Start:</span> {new Date(event.startTime).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">End:</span> {new Date(event.endTime).toLocaleString()}
            </div>
            {event.location && (
              <div>
                <span className="font-medium">Location:</span> {event.location}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PublicEventView event={event} />
      </div>
    </div>
  );
}

