import prisma from './prisma';
import { ORG_READ_PERMISSIONS } from './permissions';
import { EventWithPlanItems } from '@/types/Event';

class EventServiceForSSR {
  async findByIdAndUserId(id: string, userId: string): Promise<EventWithPlanItems | null> {
    return prisma.event.findUnique({
      where: {
        id,
        organization: {
          members: {
            some: {
              userId,
              permissions: { hasSome: ORG_READ_PERMISSIONS }
            }
          }
        },
      },
      include: {
        course: true,
        organization: { include: { members: true } },
        eventPlanItems: {
          include: {
            song: true,
            text: true,
            game: true,
            preparations: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });
  }
}

export const eventService = new EventServiceForSSR();
