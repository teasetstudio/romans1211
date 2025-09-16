import { Event, EventPlanItem } from "@prisma/client";

export interface EventWithPlanItems extends Event {
  eventPlanItems: EventPlanItem[];
}
