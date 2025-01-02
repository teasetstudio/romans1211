import { IUser } from '@/types/User';
import prisma from './prisma';
import { Organization } from '@prisma/client';

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
}

export const organizationService = new OrganizationServiceForSSR();
