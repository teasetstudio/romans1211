/*
  Warnings:

  - A unique constraint covering the columns `[linkSlug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isAvailableByLink" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_linkSlug_key" ON "Event"("linkSlug");

-- CreateIndex
CREATE INDEX "Event_isAvailableByLink_idx" ON "Event"("isAvailableByLink");

-- CreateIndex
CREATE INDEX "Event_linkSlug_idx" ON "Event"("linkSlug");
