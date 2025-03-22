/*
  Warnings:

  - Changed the type of `role` on the `EventCourseMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CourseRole" AS ENUM ('ADMIN', 'MANAGER', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "EventCourseMember" DROP COLUMN "role",
ADD COLUMN     "role" "CourseRole" NOT NULL;

-- DropEnum
DROP TYPE "EventCourseRole";
