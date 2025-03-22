-- RenameColumn
ALTER TABLE "Organization" RENAME COLUMN "userId" TO "ownerId";

-- RenameForeignKey
ALTER TABLE "Organization" RENAME CONSTRAINT "Organization_userId_fkey" TO "Organization_ownerId_fkey";
