'use client';

import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrganizationCreateAttr, useOrganization } from '@/components/contexts/OrganizationContext';
import { toast } from 'react-hot-toast';

interface OrganizationDetailsProps {
  isAdmin: boolean;
}

export default function OrganizationDetails({ isAdmin }: OrganizationDetailsProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  const params = useParams();
  const { updateOrganization, selectedOrganization } = useOrganization();
  const [form, setForm] = useState<OrganizationCreateAttr>({ 
    name: selectedOrganization?.name || '', 
    description: selectedOrganization?.description || '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateOrganization(params.id as string, {
        name: form.name,
        description: form.description
      });
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error('Failed to update organization');
      console.error('Failed to update organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      setForm({ 
        name: selectedOrganization.name,
        description: selectedOrganization.description || ''
      });
    }
  }, [selectedOrganization]);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">{t('organizationName')}</h3>
            <p className="mt-1 text-lg text-gray-900">{selectedOrganization?.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">{t('organizationDescription')}</h3>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedOrganization?.description || t('noDescription')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 pt-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Details</h2>
      </div>

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
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 