import { OrganizationPermission } from "@prisma/client";

export const ORG_ADMIN_PERMISSIONS: OrganizationPermission[] = ['OWNER', 'ADMIN'];
export const ORG_MANAGE_PERMISSIONS: OrganizationPermission[] = ['OWNER', 'ADMIN', 'MANAGE'];
export const ORG_CREATE_PERMISSIONS: OrganizationPermission[] = ['OWNER', 'ADMIN', 'MANAGE', 'CREATE'];
export const ORG_READ_PERMISSIONS: OrganizationPermission[] = ['OWNER', 'ADMIN', 'MANAGE', 'READ'];
export const ORG_EDIT_PERMISSIONS: OrganizationPermission[] = ['OWNER', 'ADMIN', 'MANAGE', 'EDIT'];
export const ORG_DELETE_PERMISSIONS: OrganizationPermission[] = ['OWNER', 'ADMIN', 'MANAGE', 'DELETE'];

export const orgPermissions = {
  admin: ORG_ADMIN_PERMISSIONS,
  manage: ORG_MANAGE_PERMISSIONS,
  create: ORG_CREATE_PERMISSIONS,
  read: ORG_READ_PERMISSIONS,
  edit: ORG_EDIT_PERMISSIONS,
  delete: ORG_DELETE_PERMISSIONS,
}

export type TOrgPermissions = keyof typeof orgPermissions;