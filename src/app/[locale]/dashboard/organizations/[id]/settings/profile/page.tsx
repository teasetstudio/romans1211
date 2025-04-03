'use client';

import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { OrganizationMember, useOrganization } from '@/components/contexts/OrganizationContext';
import OrganizationDetails from './components/OrganizationDetails';
import OrganizationMembers from './components/OrganizationMembers';
import AddOrganizationMember from './components/AddOrganizationMember';
import MemberActions from './components/MemberActions';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { ROUTE_DASHBOARD_ORGANIZATIONS } from '@/res/routes';
import { hasAdminPermission } from '@/utils/permissions';

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

  // useMemo prevent flickering when logout and session is not available
  const isOwner = useMemo(() => Boolean(selectedOrganization?.ownerId === session?.user?.id), [selectedOrganization]);
  const isAdmin = useMemo(() => Boolean(
    isOwner || 
    selectedOrganization?.members?.some(member => hasAdminPermission(member, { userId: session?.user?.id }))
  ), [selectedOrganization, isOwner]);

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('organizationSettings')}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('updateOrganizationProfile')}
          </p>
        </div>

        <OrganizationDetails isAdmin={isAdmin} />

        <OrganizationMembers
          members={members}
          loadingMembers={loadingMembers}
          afterRemoveMember={fetchMembers}
          isAdmin={isAdmin}
        />

        {isAdmin && <AddOrganizationMember fetchMembers={fetchMembers} />}

        {!isOwner && <MemberActions members={members} />}
      </div>
    </div>
  );
}
