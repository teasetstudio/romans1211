-- CreateTable
CREATE TABLE "PreparationItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "eventPlanItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreparationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PreparationItem_eventPlanItemId_idx" ON "PreparationItem"("eventPlanItemId");

-- CreateIndex
CREATE INDEX "PreparationItem_isCompleted_idx" ON "PreparationItem"("isCompleted");

-- CreateIndex
CREATE INDEX "PreparationItem_order_idx" ON "PreparationItem"("order");

-- AddForeignKey
ALTER TABLE "PreparationItem" ADD CONSTRAINT "PreparationItem_eventPlanItemId_fkey" FOREIGN KEY ("eventPlanItemId") REFERENCES "EventPlanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
