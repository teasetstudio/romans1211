-- CreateTable
CREATE TABLE "GamePreparation" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(1000) NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamePreparation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GamePreparation_gameId_idx" ON "GamePreparation"("gameId");

-- CreateIndex
CREATE INDEX "GamePreparation_order_idx" ON "GamePreparation"("order");

-- AddForeignKey
ALTER TABLE "GamePreparation" ADD CONSTRAINT "GamePreparation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
