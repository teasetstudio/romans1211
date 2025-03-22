/*
  Warnings:

  - The values [ADMIN_EVENT_BLUEPRINTS,MANAGE_EVENT_BLUEPRINTS,EDIT_EVENT_BLUEPRINTS,VIEW_EVENT_BLUEPRINTS] on the enum `OrganizationPermission` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blueprintId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `EventBlueprint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventBlueprintMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EventCourseRole" AS ENUM ('ADMIN', 'MANAGER', 'EDITOR', 'VIEWER');

-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationPermission_new" AS ENUM ('ADMIN', 'MANAGE', 'EDIT', 'VIEW', 'ADMIN_LIBRARY', 'MANAGE_LIBRARY', 'EDIT_LIBRARY', 'VIEW_LIBRARY', 'ADMIN_EVENT_COURSES', 'MANAGE_EVENT_COURSES', 'EDIT_EVENT_COURSES', 'VIEW_EVENT_COURSES');
ALTER TABLE "OrganizationMember" ALTER COLUMN "permissions" TYPE "OrganizationPermission_new"[] USING ("permissions"::text::"OrganizationPermission_new"[]);
ALTER TYPE "OrganizationPermission" RENAME TO "OrganizationPermission_old";
ALTER TYPE "OrganizationPermission_new" RENAME TO "OrganizationPermission";
DROP TYPE "OrganizationPermission_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_blueprintId_fkey";

-- DropForeignKey
ALTER TABLE "EventBlueprint" DROP CONSTRAINT "EventBlueprint_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "EventBlueprintMember" DROP CONSTRAINT "EventBlueprintMember_blueprintId_fkey";

-- DropForeignKey
ALTER TABLE "EventBlueprintMember" DROP CONSTRAINT "EventBlueprintMember_organizationMemberId_fkey";

-- DropIndex
DROP INDEX "Event_blueprintId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "blueprintId",
ADD COLUMN     "courseId" TEXT;

-- DropTable
DROP TABLE "EventBlueprint";

-- DropTable
DROP TABLE "EventBlueprintMember";

-- DropEnum
DROP TYPE "EventBlueprintRole";

-- CreateTable
CREATE TABLE "EventCourse" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "defaultDuration" INTEGER NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCourseMember" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "organizationMemberId" TEXT NOT NULL,
    "role" "EventCourseRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCourseMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventCourse_organizationId_idx" ON "EventCourse"("organizationId");

-- CreateIndex
CREATE INDEX "EventCourse_startDate_idx" ON "EventCourse"("startDate");

-- CreateIndex
CREATE INDEX "EventCourse_endDate_idx" ON "EventCourse"("endDate");

-- CreateIndex
CREATE INDEX "EventCourseMember_courseId_idx" ON "EventCourseMember"("courseId");

-- CreateIndex
CREATE INDEX "EventCourseMember_organizationMemberId_idx" ON "EventCourseMember"("organizationMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCourseMember_courseId_organizationMemberId_key" ON "EventCourseMember"("courseId", "organizationMemberId");

-- CreateIndex
CREATE INDEX "Event_courseId_idx" ON "Event"("courseId");

-- AddForeignKey
ALTER TABLE "EventCourse" ADD CONSTRAINT "EventCourse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EventCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCourseMember" ADD CONSTRAINT "EventCourseMember_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EventCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCourseMember" ADD CONSTRAINT "EventCourseMember_organizationMemberId_fkey" FOREIGN KEY ("organizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
