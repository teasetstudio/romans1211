'use client';

import { updateMaterial } from '@/api/requests/materials';
import { useRouter } from 'next/navigation';
import MaterialForm from '@/components/forms/MaterialForm';

interface Material {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  language: string;
  type: 'text' | 'song' | 'game';
  tags: Array<{ id: string; name: string }>;
  organization: {
    id: string;
    name: string;
  };
}

interface Props {
  material: Material;
}

export default function EditForm({ material }: Props) {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    language: string;
    isPublic: boolean;
    tags: string[];
    type: 'text' | 'song' | 'game';
  }) => {
    await updateMaterial(material.id, {
      ...data,
      organizationId: material.organization.id,
    });

    router.push(`/dashboard/library/${material.type}/${material.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
        submitLabel="Save Changes"
        cancelHref={`/dashboard/library/${material.type}/${material.id}`}
      />
    </div>
  );
}
