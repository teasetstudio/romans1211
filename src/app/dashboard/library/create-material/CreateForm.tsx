'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/components/contexts/OrganizationContext';
import { postMaterial } from '@/api/requests/materials';
import MaterialForm from '@/components/forms/MaterialForm';
import { ROUTE_DASHBOARD_LIBRARY } from '@/res/routes';
import { TMaterialType } from '@/types/Materials';
import { IconExclamationCircle } from '@tabler/icons-react';

interface Props {
  defaultType?: TMaterialType;
}

export default function CreateForm({ defaultType }: Props) {
  const router = useRouter();
  const { selectedOrganization } = useOrganization();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    language: string;
    isPublic: boolean;
    tags: string[];
    type: TMaterialType;
  }) => {
    if (!selectedOrganization) {
      setError('Please select an organization before creating a material.');
      return;
    }

    setLoading(true);
    try {
      const material = await postMaterial({
        ...data,
        organizationId: selectedOrganization.id,
      });

      // Redirect to library page after successful creation
      router.push(ROUTE_DASHBOARD_LIBRARY);
    } catch (error) {
      console.error('Error creating material:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while creating the material. Please try again.'
      );
      throw error; // Re-throw to let MaterialForm handle the error state
    } finally {
      setLoading(false);
    }
  };

  if (!selectedOrganization) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <IconExclamationCircle className="size-5 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-700">
            Please select an organization before creating a material.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <IconExclamationCircle className="size-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <MaterialForm
        initialData={{
          title: '',
          content: '',
          language: 'en',
          isPublic: false,
          tags: [],
          organizationId: selectedOrganization.id,
          type: defaultType || 'text',
        }}
        onSubmit={handleSubmit}
        submitLabel="Create Material"
        cancelHref={ROUTE_DASHBOARD_LIBRARY}
      />
    </div>
  );
}