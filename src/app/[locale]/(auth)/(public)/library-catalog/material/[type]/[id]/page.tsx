import { notFound } from 'next/navigation';
import { IdAndTypeParams } from '@/types/Params';
import React from 'react';
import { getCachedPublicMaterial } from '@/lib/MaterialServiceForSSR';
import { isValidMaterialType } from '@/utils';
import MaterialTranslations from '../../../components/MaterialTranslations';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import '@/styles/tiptap-components.css';

export async function generateMetadata({ params }: IdAndTypeParams): Promise<Metadata> {
  const { id, type } = await params;

  if (!isValidMaterialType(type)) return {};

  const material = await getCachedPublicMaterial(type, id);
  if (!material) return {};

  const locale = await getLocale();
  const description = material.tags.length > 0
    ? material.tags.map((tag) => tag.name).join(', ')
    : material.organization.name;
  const url = `/${locale}/library-catalog/material/${type}/${id}`;

  const ogImageMap: Record<string, string> = {
    text: '/images/text_placeholder.png',
    song: '/images/music_placeholder.png',
    game: '/images/game_placeholder.png',
  };
  const image = ogImageMap[type];

  return {
    title: material.title,
    description,
    openGraph: {
      title: material.title,
      description,
      url,
      images: [{ url: image }],
    },
  };
}

export default async function MaterialPage({ params }: IdAndTypeParams) {
  const { id, type } = await params;

  if (!isValidMaterialType(type)) notFound();

  const material = await getCachedPublicMaterial(type, id);
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

        {material.preparations && material.preparations.length > 0 && (
          <div className="mb-6 bg-slate-100 border border-slate-200 rounded-lg shadow p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Preparations</h3>
            <ol className="list-decimal pl-6 space-y-2 marker:text-slate-400">
              {material.preparations.map((prep) => (
                <li key={prep.id} className="text-gray-800 leading-relaxed">
                  <span className="font-medium">{prep.title}</span>
                  {prep.isOptional && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      Optional
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

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
