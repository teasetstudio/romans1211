import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { AsyncIdParam } from "@/types/Params";

import EventPlanItems from "./components/EventPlanItems";
import EventDetails from "./components/EventDetails";
import { authOptions } from "@/lib/auth";
import { eventService } from "@/lib/EventServiceForSSR";

export default async function EventPage({ params }: { params: AsyncIdParam }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const { id } = await params;

  const event = await eventService.findByIdAndUserId(id, session.user.id);

  if (!event) {
    notFound();
  }

  return (
    <>
      <EventDetails event={event} session={session} />
      <EventPlanItems event={event} session={session} />
    </>
  );
}
