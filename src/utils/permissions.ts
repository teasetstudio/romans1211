import { Organization, OrganizationMember } from '@/components/contexts/OrganizationContext';
import { ORG_ADMIN_PERMISSIONS, ORG_CREATE_PERMISSIONS, ORG_DELETE_PERMISSIONS, ORG_EDIT_PERMISSIONS, ORG_MANAGE_PERMISSIONS, ORG_READ_PERMISSIONS } from '@/lib/permissions';
import { OrganizationPermission } from '@prisma/client';

type ValidateMemberCriteria = {
  userId?: string; // Checks if the provided userId matches the member's userId
  isAcceptedCheck?: boolean;
}

const validateMemberCriteria = (member: OrganizationMember, criteria?: ValidateMemberCriteria): boolean => {
  if (!criteria) return true;

  if (criteria.userId && member.userId !== criteria.userId) {
    return false
  }
  if (criteria.isAcceptedCheck && !member.isAccepted) {
    return false
  }
  return true
}

export const hasAdminPermission = (member: OrganizationMember | undefined, criteria?: ValidateMemberCriteria): boolean => {
  if (!member) return false;
  return validateMemberCriteria(member, criteria) && 
    member.permissions.some(permission => ORG_ADMIN_PERMISSIONS.includes(permission as OrganizationPermission));
};

export const hasManagePermission = (member: OrganizationMember | undefined, criteria?: ValidateMemberCriteria): boolean => {
  if (!member) return false;
  return validateMemberCriteria(member, criteria) && 
    member.permissions.some(permission => ORG_MANAGE_PERMISSIONS.includes(permission as OrganizationPermission));
};

export const hasReadPermission = (member: OrganizationMember | undefined, criteria?: ValidateMemberCriteria): boolean => {
  if (!member) return false;
  return validateMemberCriteria(member, criteria) && 
    member.permissions.some(permission => ORG_READ_PERMISSIONS.includes(permission as OrganizationPermission));
};

export const hasCreatePermission = (member: OrganizationMember | undefined, criteria?: ValidateMemberCriteria): boolean => {
  if (!member) return false;
  return validateMemberCriteria(member, criteria) && 
    member.permissions.some(permission => ORG_CREATE_PERMISSIONS.includes(permission as OrganizationPermission));
};

export const userInOrganizationData = (userId: string, org?: Organization | null) => {
  if (!org) {
    return {
      member: null,
      isPendingInvitation: false,
      isOwner: false,
      hasAdminPermission: false,
      hasManageAccess: false,
      hasReadPermission: false,
      hasCreatePermission: false,
      hasDeletePermission: false,
      hasEditPermission: false,
    };
  }
  const member = org.members?.find(m => m.userId === userId);
  if (!member) {
    return {
      member: null,
      isPendingInvitation: false,
      isOwner: org.ownerId === userId,
      hasAdminPermission: false,
      hasManageAccess: false,
      hasReadPermission: false,
      hasCreatePermission: false,
      hasDeletePermission: false,
      hasEditPermission: false,
    };
  }
  const isPendingInvitation = !member.isAccepted;
  const isOwner = org.ownerId === userId;
  
  let hasAdminAccess = isOwner;
  let hasManageAccess = isOwner;
  let hasReadAccess = isOwner;
  let hasWriteAccess = isOwner;
  let hasEditAccess = isOwner;
  let hasDeleteAccess = isOwner;
  
  if (!isOwner && member.isAccepted) {
    // Single iteration over permissions
    const permissions = member.permissions as OrganizationPermission[];
    for (const permission of permissions) {
      if (!hasAdminAccess && ORG_ADMIN_PERMISSIONS.includes(permission)) {
        hasAdminAccess = true;
      }
      
      if (!hasManageAccess && ORG_MANAGE_PERMISSIONS.includes(permission)) {
        hasManageAccess = true;
      }

      if (!hasReadAccess && ORG_READ_PERMISSIONS.includes(permission)) {
        hasReadAccess = true;
      }
      if (!hasWriteAccess && ORG_CREATE_PERMISSIONS.includes(permission)) {
        hasWriteAccess = true;
      }

      if (!hasEditAccess && ORG_EDIT_PERMISSIONS.includes(permission)) {
        hasEditAccess = true;
      }

      if (!hasDeleteAccess && ORG_DELETE_PERMISSIONS.includes(permission)) {
        hasDeleteAccess = true;
      }
    }
  }

  return {
    member,
    isPendingInvitation,
    isOwner,
    hasAdminPermission: hasAdminAccess,
    hasManagePermission: hasManageAccess,
    hasReadPermission: hasReadAccess,
    hasCreatePermission: hasWriteAccess,
    hasEditPermission: hasEditAccess,
    hasDeletePermission: hasDeleteAccess,
  }
};
