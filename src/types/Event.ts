import { Event, EventPlanItem, PreparationItem } from "@prisma/client";

export interface EventPlanItemWithPreparations extends EventPlanItem {
  preparations: PreparationItem[];
}

export interface EventWithPlanItems extends Event {
  eventPlanItems: EventPlanItemWithPreparations[];
}
