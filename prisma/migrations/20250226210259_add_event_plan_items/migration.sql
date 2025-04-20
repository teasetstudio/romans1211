/*
  Warnings:

  - You are about to drop the column `recurrenceRule` on the `EventBlueprint` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventPlanItemType" AS ENUM ('SONG', 'TEXT', 'GAME', 'COMMENT', 'CUSTOM');

-- AlterTable
-- ALTER TABLE "Course" DROP COLUMN "recurrenceRule";

-- CreateTable
CREATE TABLE "EventPlanItem" (
    "id" TEXT NOT NULL,
    "type" "EventPlanItemType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,
    "startHour" INTEGER,
    "startMinute" INTEGER,
    "endHour" INTEGER,
    "endMinute" INTEGER,
    "songId" TEXT,
    "textId" TEXT,
    "gameId" TEXT,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPlanItem_eventId_idx" ON "EventPlanItem"("eventId");

-- CreateIndex
CREATE INDEX "EventPlanItem_order_idx" ON "EventPlanItem"("order");

-- AddForeignKey
ALTER TABLE "EventPlanItem" ADD CONSTRAINT "EventPlanItem_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlanItem" ADD CONSTRAINT "EventPlanItem_textId_fkey" FOREIGN KEY ("textId") REFERENCES "Text"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlanItem" ADD CONSTRAINT "EventPlanItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlanItem" ADD CONSTRAINT "EventPlanItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
