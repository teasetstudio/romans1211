import { IUser } from '@/types/User';
import prisma from './prisma';
import { Organization } from '@prisma/client';
import { cookies } from 'next/headers';

class OrganizationServiceForSSR {
  async getUserOrganizations(user: IUser): Promise<Organization[]> {
    const organizations: Organization[] = await prisma.organization.findMany({
      where: { userId: user.id },
    });

    if (organizations.length === 0) {
      const newOrganization = await prisma.organization.create({
        data: {
          name: user.name,
          isDefault: true,
          userId: user.id,
        },
      });
      organizations.push(newOrganization);
    }

    return organizations;
  }

  async getSelectedOrganization(userId: string): Promise<Organization | null> {
    const cookieStore = await cookies();
    const selectedOrgId = cookieStore.get('selectedOrganizationId')?.value;

    const organization = await prisma.organization.findFirst({
      where: selectedOrgId 
        ? { id: selectedOrgId, userId }
        : { userId, isDefault: true },
    });

    return organization;
  }
}

export const organizationService = new OrganizationServiceForSSR();
