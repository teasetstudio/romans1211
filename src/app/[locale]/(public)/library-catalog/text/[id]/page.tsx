import { notFound } from 'next/navigation';
import { AsyncParams } from '@/types/Params';
import React from 'react';
import { materialService } from '@/lib/MaterialServiceForSSR';

export default async function TextPage({ params }: AsyncParams) {
  const { id } = await params;
  const text = await materialService.findPublicById('text', id)

  if (!text) notFound();

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{text.title}</h1>
            <div className="text-sm text-gray-500">
              {text.organization.name}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {text.tags.map((tag) => (
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: text.content }}
          />
        </div>

        {/* Footer Section */}
        <div className="flex justify-between text-sm text-gray-500">
          <div className="space-x-4">
            <span>Created: {new Date(text.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(text.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
