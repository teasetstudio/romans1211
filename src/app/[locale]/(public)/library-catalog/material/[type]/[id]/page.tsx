import { notFound } from 'next/navigation';
import { IdAndTypeParams } from '@/types/Params';
import React from 'react';
import { materialService } from '@/lib/MaterialServiceForSSR';
import { isValidMaterialType } from '@/utils';
import MaterialTranslations from '../../../components/MaterialTranslations';

import '@/styles/tiptap-components.css';

export default async function MaterialPage({ params }: IdAndTypeParams) {
  const { id, type } = await params;

  if (!isValidMaterialType(type)) notFound();

  const material = await materialService.findPublicById(type, id);
  if (!material) notFound();

  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto pt-4">
        {/* Header Section */}
        <MaterialTranslations material={material} type={type} />

        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{material.title}</h1>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {material.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-slate-200 border border-slate-300 rounded-lg shadow-xl p-4 mb-6">
          <div
            className="tiptap-wrapper whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: material.content }}
          />
        </div>

        {/* Footer Section */}
        <div className="flex justify-between text-sm text-gray-500">
          <div className="text-sm text-gray-500">
            {material.organization.name}
          </div>
          <div className="space-x-4">
            <span>Created: {new Date(material.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(material.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
