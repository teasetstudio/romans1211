'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTE_DASHBOARD_ORGANIZATIONS } from '@/res/routes';
import { useSession } from 'next-auth/react';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  members: Array<{
    id: string;
    userId: string;
    permissions: string[];
    isAccepted: boolean;
  }>;
}

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(`/api/organizations/${params.id}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch organization');
        }
        const data = await response.json();
        setOrganization(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organization');
        router.push(ROUTE_DASHBOARD_ORGANIZATIONS);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchOrganization();
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  const isOwner = organization.ownerId === session?.user?.id;
  const userMembership = organization.members.find(m => m.userId === session?.user?.id);
  const userPermissions = userMembership?.permissions || [];

  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{organization.name}</h1>
                {organization.description && (
                  <p className="mt-1 text-sm text-gray-500">{organization.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {isOwner ? 'Owner' : 'Member'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Permissions</h2>
              <div className="flex flex-wrap gap-2">
                {userPermissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800"
                  >
                    {permission.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 