-- CreateTable
CREATE TABLE "DefaultEventPlanItem" (
    "id" TEXT NOT NULL,
    "type" "EventPlanItemType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isReserve" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "startHour" INTEGER,
    "startMinute" INTEGER,
    "endHour" INTEGER,
    "endMinute" INTEGER,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultEventPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultPreparationItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "eventPlanItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultPreparationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DefaultEventPlanItem_courseId_idx" ON "DefaultEventPlanItem"("courseId");

-- CreateIndex
CREATE INDEX "DefaultEventPlanItem_order_idx" ON "DefaultEventPlanItem"("order");

-- CreateIndex
CREATE INDEX "DefaultPreparationItem_eventPlanItemId_idx" ON "DefaultPreparationItem"("eventPlanItemId");

-- CreateIndex
CREATE INDEX "DefaultPreparationItem_order_idx" ON "DefaultPreparationItem"("order");

-- AddForeignKey
ALTER TABLE "DefaultEventPlanItem" ADD CONSTRAINT "DefaultEventPlanItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultPreparationItem" ADD CONSTRAINT "DefaultPreparationItem_eventPlanItemId_fkey" FOREIGN KEY ("eventPlanItemId") REFERENCES "DefaultEventPlanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
