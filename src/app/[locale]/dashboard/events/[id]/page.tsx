"use server"

import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { AsyncIdParam } from "@/types/Params";
import prisma from "@/lib/prisma";
import EventPlanItems from "./components/EventPlanItems";
import EventDetails from "./components/EventDetails";

export default async function EventPage({ params }: { params: AsyncIdParam }) {
  const session = await getServerSession();
  if (!session?.user) return null;

  const { id } = await params;

  // Fetch the event with all related data
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      course: true,
      // members: {
      //   include: {
      //     organizationMember: {
      //       include: {
      //         user: {
      //           select: {
      //             id: true,
      //             name: true,
      //             email: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
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
      <EventDetails event={event} />
      <EventPlanItems event={event} />
    </>
  );
}
