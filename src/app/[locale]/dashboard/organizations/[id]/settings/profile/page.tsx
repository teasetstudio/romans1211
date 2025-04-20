'use client';

import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Text } from "@/components/typo/Text";
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { ROUTE_DASHBOARD_ORGANIZATIONS } from '@/res/routes';
import { userInOrganizationData } from '@/utils/permissions';
import { OrganizationMember, useOrganization } from '@/components/contexts/OrganizationContext';

import MemberActions from './components/MemberActions';
import OrganizationDetails from './components/OrganizationDetails';
import OrganizationMembers from './components/OrganizationMembers';
import AddOrganizationMember from './components/AddOrganizationMember';

export default function OrganizationSettingsPage() {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  const router = useRouter();
  const params = useParams();
  const { selectedOrganization, organizations, setSelectedOrganization } = useOrganization();
  const { data: session } = useSession();

  // Update selected organization when params.id changes
  useEffect(() => {
    if (params.id && params.id !== selectedOrganization?.id) {
      const org = organizations.find(org => org.id === params.id);
      if (org) {
        setSelectedOrganization(org);
      } else {
        router.push(ROUTE_DASHBOARD_ORGANIZATIONS);
      }
    }
  }, [params.id]);

  // UseEffect to handle the case where the selected organization is not found
  // or the URL is not the same as the selected organization (organization is changed via the sidebar organization switcher)
  useEffect(() => {
    if (!selectedOrganization) {
      router.push(ROUTE_DASHBOARD_ORGANIZATIONS);
    } else if (params.id && params.id !== selectedOrganization?.id) {
      // silently update URL without any page reload or history changes
      window.history.replaceState({}, '', `/dashboard/organizations/${selectedOrganization?.id}/settings/profile`);
    }
  }, [selectedOrganization]);

  // Members state
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch members when component mounts
  useEffect(() => {
    if (params.id) {
      fetchMembers();
    }
  }, [params.id]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch(`/api/organization-members?organizationId=${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch members');
      }

      setMembers(data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch members');
    } finally {
      setLoadingMembers(false);
    }
  };

  if (!selectedOrganization) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-muted-foreground">{t("selectOrganization")}</Text>
      </div>
    );
  }

  const { isOwner, hasAdminPermission } = useMemo(() => 
    userInOrganizationData(session?.user?.id ?? '', selectedOrganization), 
    [session?.user?.id, selectedOrganization]
  );

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('organizationSettings')}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('updateOrganizationProfile')}
          </p>
        </div>

        <OrganizationDetails isAdmin={hasAdminPermission} />

        <OrganizationMembers
          members={members}
          loadingMembers={loadingMembers}
          afterRemoveMember={fetchMembers}
          isAdmin={hasAdminPermission}
        />

        {hasAdminPermission && <AddOrganizationMember fetchMembers={fetchMembers} />}

        {!isOwner && <MemberActions members={members} />}
      </div>
    </div>
  );
}
