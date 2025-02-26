-- CreateEnum
CREATE TYPE "OrganizationPermission" AS ENUM ('ADMIN', 'ADMIN_LIBRARY', 'MANAGE_LIBRARY', 'EDIT_LIBRARY', 'VIEW_LIBRARY', 'ADMIN_EVENT_BLUEPRINTS', 'MANAGE_EVENT_BLUEPRINTS', 'EDIT_EVENT_BLUEPRINTS', 'VIEW_EVENT_BLUEPRINTS');

-- CreateEnum
CREATE TYPE "EventBlueprintRole" AS ENUM ('ADMIN', 'MANAGER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('ADMIN', 'MANAGER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "permissions" "OrganizationPermission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventBlueprint" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "recurrenceRule" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "defaultDuration" INTEGER NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "organizationId" TEXT NOT NULL,
    "blueprintId" TEXT,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventBlueprintMember" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "organizationMemberId" TEXT NOT NULL,
    "role" "EventBlueprintRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBlueprintMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMember" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "organizationMemberId" TEXT NOT NULL,
    "role" "EventRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationRole_organizationId_idx" ON "OrganizationRole"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_organizationId_name_key" ON "OrganizationRole"("organizationId", "name");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_roleId_idx" ON "OrganizationMember"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "EventBlueprint_organizationId_idx" ON "EventBlueprint"("organizationId");

-- CreateIndex
CREATE INDEX "EventBlueprint_startDate_idx" ON "EventBlueprint"("startDate");

-- CreateIndex
CREATE INDEX "EventBlueprint_endDate_idx" ON "EventBlueprint"("endDate");

-- CreateIndex
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");

-- CreateIndex
CREATE INDEX "Event_blueprintId_idx" ON "Event"("blueprintId");

-- CreateIndex
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");

-- CreateIndex
CREATE INDEX "Event_endTime_idx" ON "Event"("endTime");

-- CreateIndex
CREATE INDEX "EventBlueprintMember_blueprintId_idx" ON "EventBlueprintMember"("blueprintId");

-- CreateIndex
CREATE INDEX "EventBlueprintMember_organizationMemberId_idx" ON "EventBlueprintMember"("organizationMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBlueprintMember_blueprintId_organizationMemberId_key" ON "EventBlueprintMember"("blueprintId", "organizationMemberId");

-- CreateIndex
CREATE INDEX "EventMember_eventId_idx" ON "EventMember"("eventId");

-- CreateIndex
CREATE INDEX "EventMember_organizationMemberId_idx" ON "EventMember"("organizationMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventMember_eventId_organizationMemberId_key" ON "EventMember"("eventId", "organizationMemberId");

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBlueprint" ADD CONSTRAINT "EventBlueprint_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "EventBlueprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBlueprintMember" ADD CONSTRAINT "EventBlueprintMember_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "EventBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBlueprintMember" ADD CONSTRAINT "EventBlueprintMember_organizationMemberId_fkey" FOREIGN KEY ("organizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_organizationMemberId_fkey" FOREIGN KEY ("organizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
