-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "originalId" TEXT;

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "originalId" TEXT;

-- AlterTable
ALTER TABLE "Text" ADD COLUMN     "originalId" TEXT;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "Text"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
