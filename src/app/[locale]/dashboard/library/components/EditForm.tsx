'use client';

import { updateMaterial } from '@/api/requests/materials';
import { useRouter } from '@/i18n/routing';
import MaterialForm from '@/components/forms/MaterialForm';
import { getDashboardMaterialUrl } from '@/utils/urls';
import { TMaterialType, TMaterialWithIncluded } from '@/types/Materials';

type TMaterial = TMaterialWithIncluded & { type: TMaterialType };
interface IProps {
  material: TMaterial;
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
    await updateMaterial(material.id, {
      ...data,
      organizationId: material.organization.id,
    });

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
        }}
        editType={material.type}
        onSubmit={handleSubmit}
        cancelHref={dashboardMaterialUrl}
      />
    </div>
  );
}
