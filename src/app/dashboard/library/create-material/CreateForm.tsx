'use client';

import { useRouter } from 'next/navigation';
import { useOrganization } from '@/components/contexts/OrganizationContext';
import { postMaterial } from '@/api/requests/materials';
import MaterialForm from '@/components/forms/MaterialForm';
import { ROUTE_DASHBOARD_LIBRARY } from '@/res/routes';
import { TMaterialType } from '@/types/Materials';

export default function CreateForm() {
  const router = useRouter();
  const { selectedOrganization } = useOrganization();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    language: string;
    isPublic: boolean;
    tags: string[];
    type: TMaterialType;
  }) => {
    if (!selectedOrganization) {
      // Show error or redirect to organization selection
      console.error('No organization selected');
      return;
    }
    try {
      const material = await postMaterial({
        ...data,
        organizationId: selectedOrganization.id,
      }).catch((err) => {
        console.error('err', err.stack)
      });

      router.push(ROUTE_DASHBOARD_LIBRARY);
    } catch (error) {
      console.error('Error creating material:', error);
      // Handle error appropriately
    }
  };

  if (!selectedOrganization) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <MaterialForm
        initialData={{
          title: '',
          content: '',
          language: 'en',
          isPublic: false,
          tags: [],
          organizationId: selectedOrganization.id,
          type: 'text' as const,
        }}
        onSubmit={handleSubmit}
        submitLabel="Create Material"
      />
    </div>
  );
}