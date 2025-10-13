'use client';

import { useRouter } from '@/i18n/routing';
import MaterialForm from '@/components/forms/MaterialForm';
import { getDashboardMaterialUrl } from '@/utils/urls';
import { TMaterial_Tags_Org, TMaterialType } from '@/types/Materials';
import { GamePreparation } from '@prisma/client';

type Material = TMaterial_Tags_Org & { type: TMaterialType };
interface IProps {
  material: Material & { preparations?: Array<GamePreparation> };
}

export default function EditForm({ material }: IProps) {
  const router = useRouter();
  const dashboardMaterialUrl = getDashboardMaterialUrl({type: material.type, id: material.id})

  const handleSubmit = async (data: {
    title: string;
    content: string;
    language: string;
    isPublic: boolean;
    tags: string[];
    type: TMaterialType;
  }) => {
    const response = await fetch(`/api/materials/${material.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update material');
    }

    router.push(dashboardMaterialUrl);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 pt-8 md:pt-4 md:p-4">
      <MaterialForm
        initialData={{
          id: material.id,
          title: material.title,
          content: material.content,
          language: material.language,
          isPublic: material.isPublic,
          type: material.type,
          tags: material.tags.map(tag => tag.name),
          organizationId: material.organization.id,
          preparations: material.preparations,
        }}
        editType={material.type}
        onSubmit={handleSubmit}
        cancelHref={dashboardMaterialUrl}
      />
    </div>
  );
}
