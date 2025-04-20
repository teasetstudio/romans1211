import { IUser } from '@/types/User';
import prisma from './prisma';
import { Organization } from '@prisma/client';
import { cookies } from 'next/headers';
import { ORG_READ_PERMISSIONS } from './permissions';

class OrganizationServiceForSSR {
  async getUserOrganizations(user: IUser): Promise<Organization[]> {
    const organizations: Organization[] = await prisma.organization.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    if (organizations.length === 0) {
      const newOrganization = await this.createOrganization({
        name: user.name,
        ownerId: user.id,
        isDefault: true
      });
      organizations.push(newOrganization);
    }

    return organizations;
  }

  async getUserMemberOrganizations(user: IUser): Promise<Organization[]> {
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
            isAccepted: true
          }
        }
      },
      include: {
        members: {
          where: {
            userId: user.id
          },
          select: {
            permissions: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return organizations;
  }

  async getUserAccessibleOrganizations(user: IUser): Promise<Organization[]> {
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                // isAccepted: true
              }
            }
          }
        ]
      },
      include: {
        members: {
          where: {
            userId: user.id
          },
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return organizations;
  }

  async getSelectedOrganization(userId: string): Promise<Organization | null> {
    const cookieStore = await cookies();
    const selectedOrgId = cookieStore.get('selectedOrganizationId')?.value;
    console.log('selectedOrgId', selectedOrgId)
    let organization: Organization | null = null;
    if (selectedOrgId) {
      organization = await this.getOrganizationByIdAndUserId(selectedOrgId, userId);
    }

    return organization;
  }

  async getOrganizationByIdAndUserId(organizationId: string, userId: string): Promise<Organization | null> {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        members: {
          some: {
            userId,
            permissions: {
              hasSome: ORG_READ_PERMISSIONS
            }
          }
        }
      },
      include: {
        members: {
          where: {
            userId
          }
        }
      },
    });

    return organization;
  }

  async createOrganization({ name, description, ownerId, isDefault = false }: { name: string, description?: string, ownerId: string, isDefault?: boolean }): Promise<Organization> {
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        ownerId,
        isDefault,
        members: {
          create: {
            userId: ownerId,
            permissions: ['OWNER'],
            isAccepted: true,
            acceptedAt: new Date(),
          }
        }
      },
      include: { members: true }
    });
    return organization;
  }
}

export const organizationService = new OrganizationServiceForSSR();
