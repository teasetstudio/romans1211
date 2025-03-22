/*
  Warnings:

  - You are about to drop the column `roleId` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the `OrganizationRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrganizationPermission" ADD VALUE 'MANAGE';
ALTER TYPE "OrganizationPermission" ADD VALUE 'EDIT';
ALTER TYPE "OrganizationPermission" ADD VALUE 'VIEW';

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_roleId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationRole" DROP CONSTRAINT "OrganizationRole_organizationId_fkey";

-- DropIndex
DROP INDEX "OrganizationMember_roleId_idx";

-- AlterTable
ALTER TABLE "OrganizationMember" DROP COLUMN "roleId",
ADD COLUMN     "permissions" "OrganizationPermission"[];

-- DropTable
DROP TABLE "OrganizationRole";
