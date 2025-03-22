/*
  Warnings:

  - You are about to drop the `EventCourseMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventCourseMember" DROP CONSTRAINT "EventCourseMember_courseId_fkey";

-- DropForeignKey
ALTER TABLE "EventCourseMember" DROP CONSTRAINT "EventCourseMember_organizationMemberId_fkey";

-- DropTable
DROP TABLE "EventCourseMember";

-- CreateTable
CREATE TABLE "CourseMember" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "organizationMemberId" TEXT NOT NULL,
    "role" "CourseRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseMember_courseId_idx" ON "CourseMember"("courseId");

-- CreateIndex
CREATE INDEX "CourseMember_organizationMemberId_idx" ON "CourseMember"("organizationMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMember_courseId_organizationMemberId_key" ON "CourseMember"("courseId", "organizationMemberId");

-- AddForeignKey
ALTER TABLE "CourseMember" ADD CONSTRAINT "CourseMember_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EventCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMember" ADD CONSTRAINT "CourseMember_organizationMemberId_fkey" FOREIGN KEY ("organizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
