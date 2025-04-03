import { OrganizationMember } from '@/components/contexts/OrganizationContext';
import { ORG_ADMIN_PERMISSIONS, ORG_READ_PERMISSIONS } from '@/lib/permissions';
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

export const hasReadPermission = (member: OrganizationMember | undefined, criteria?: ValidateMemberCriteria): boolean => {
  if (!member) return false;
  return validateMemberCriteria(member, criteria) && 
    member.permissions.some(permission => ORG_READ_PERMISSIONS.includes(permission as OrganizationPermission));
};
