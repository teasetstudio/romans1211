'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MaterialForm, { ISubmitData } from '@/components/forms/MaterialForm';
import { TMaterial, TMaterialsIncludedTags, TMaterialType } from '@/types/Materials';
import { getDashboardMaterialUrl } from '@/utils/urls';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useTranslations } from 'next-intl';
import { GamePreparation } from '@prisma/client';

interface CreateTranslationFormProps {
  material: TMaterial & Required<TMaterialsIncludedTags> & { preparations?: Array<GamePreparation> };
  type: TMaterialType;
}

export default function CreateTranslationForm({ material, type }: CreateTranslationFormProps) {
  const router = useRouter();
  const t = useTranslations(NAMESPACE_DASHBOARD);

  const onAddTranslation = async (data: ISubmitData) => {
    const response = await fetch('/api/materials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        originalId: material.id,
        type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create translation');
    }

    const result = await response.json();
    router.push(getDashboardMaterialUrl({ type, id: result.id }));
  };

  return (
    <>
      {/* Original content display */}
      {/* <div className="mb-8 border rounded-lg p-4 bg-gray-50">
        <div className="font-medium text-sm mb-2">Original Content:</div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: originalText.content }}
        />
      </div> */}

      <MaterialForm
        initialData={{
          title: material.title,
          content: material.content,
          language: '',
          isPublic: material.isPublic,
          tags: material.tags.map(tag => tag.name),
          organizationId: material.organizationId,
          type,
          preparations: material.preparations,
        }}
        onSubmit={onAddTranslation}
        editType={type}
        formTitle={t('form.create_translation')}
        submitLabel={t('form.create_translation')}
        cancelHref={getDashboardMaterialUrl({ type, id: material.id })}
      />
    </>
  );
}
