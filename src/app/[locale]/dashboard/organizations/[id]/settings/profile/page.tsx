'use client';

import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrganizationCreateAttr, useOrganization } from '@/components/contexts/OrganizationContext';
import { ROUTE_DASHBOARD_ORGANIZATIONS } from '@/res/routes';

export default function OrganizationSettingsPage() {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  const router = useRouter();
  const params = useParams();
  const { organizations, updateOrganization } = useOrganization();
  const [form, setForm] = useState<OrganizationCreateAttr>({ 
    name: '', 
    description: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const organization = organizations.find(org => org.id === params.id);
    if (organization) {
      setForm({ 
        name: organization.name,
        description: organization.description || ''
      });
    } else {
      // Organization not found, redirect to organizations list
      router.push(ROUTE_DASHBOARD_ORGANIZATIONS);
    }
  }, [organizations, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateOrganization(params.id as string, {
        name: form.name,
        description: form.description
      });
      router.push(ROUTE_DASHBOARD_ORGANIZATIONS);
    } catch (error) {
      console.error('Failed to update organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('organizationSettings')}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('updateOrganizationProfile')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('organizationName')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                placeholder={t('enterOrganizationName')}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {t('organizationDescription')}
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('enterOrganizationDescription')}
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push(ROUTE_DASHBOARD_ORGANIZATIONS)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
