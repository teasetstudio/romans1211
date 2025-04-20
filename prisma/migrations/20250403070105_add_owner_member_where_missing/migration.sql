-- Insert a new OrganizationMember with OWNER permissions
INSERT INTO "OrganizationMember" (
    id,
    "userId",
    "organizationId",
    permissions,
    "isAccepted",
    "invitedAt",
    "acceptedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid(),  -- Generate a unique ID for the member
    o."ownerId",        -- Set the userId as the organization's ownerId
    o.id,               -- Use the organizationId from the Organization table
    ARRAY['OWNER']::"OrganizationPermission"[],  -- Set permissions as OWNER
    TRUE,               -- Mark the member as accepted
    NOW(),              -- Invitation timestamp
    NOW(),              -- Acceptance timestamp
    NOW(),              -- Created at timestamp
    NOW()               -- Updated at timestamp
FROM "Organization" o
WHERE o."ownerId" IS NOT NULL  -- Ensure the organization has an ownerId
  AND NOT EXISTS (
    SELECT 1
    FROM "OrganizationMember" om
    WHERE om."organizationId" = o.id
    AND 'OWNER' = ANY(om.permissions)  -- Check if OWNER already exists
    AND om."userId" = o."ownerId"     -- Ensure the userId is the ownerId
  );
