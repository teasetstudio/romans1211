-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "description" VARCHAR(30000);

-- RenameColumn
ALTER TABLE "Organization" RENAME COLUMN "userId" TO "ownerId";

-- RenameForeignKey
ALTER TABLE "Organization" RENAME CONSTRAINT "Organization_userId_fkey" TO "Organization_ownerId_fkey";