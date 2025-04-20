"use server"

import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { AsyncIdParam } from "@/types/Params";
import prisma from "@/lib/prisma";
import { ORG_READ_PERMISSIONS } from "@/lib/permissions";

import EventPlanItems from "./components/EventPlanItems";
import EventDetails from "./components/EventDetails";
import { authOptions } from "@/lib/auth";

export default async function EventPage({ params }: { params: AsyncIdParam }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const { id } = await params;

  // Fetch the event with all related data
  const event = await prisma.event.findUnique({
    where: {
      id,
      organization: {
        members: {
          some: {
            userId: session.user.id,
            permissions: { hasSome: ORG_READ_PERMISSIONS }
          }
        }
      },
    },
    include: {
      course: true,
      organization: {
        include: {
          members: true
        }
      },
      eventPlanItems: {
        include: {
          song: true,
          text: true,
          game: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

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
