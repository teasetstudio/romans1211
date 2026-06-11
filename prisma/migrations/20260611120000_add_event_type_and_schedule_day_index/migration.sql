-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LIST', 'SCHEDULE');

-- AlterTable
ALTER TABLE "DefaultEventPlanItem" ADD COLUMN     "dayIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'LIST';

-- AlterTable
ALTER TABLE "EventPlanItem" ADD COLUMN     "dayIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "EventPlanItem_eventId_dayIndex_order_idx" ON "EventPlanItem"("eventId", "dayIndex", "order");

