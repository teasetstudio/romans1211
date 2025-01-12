import React from 'react';
import { notFound } from 'next/navigation';
import { AsyncParams } from '@/types/Params';
import { materialService } from '@/lib/MaterialServiceForSSR';

import '@/styles/tiptap-components.css';

export default async function SongPage({ params }: AsyncParams) {
  const { id } = await params;
  const song = await materialService.findPublicById('song', id)

  if (!song) notFound();

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{song.title}</h1>
            <div className="text-sm text-gray-500">
              {song.organization.name}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {song.tags.map((tag) => (
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
            className="tiptap-wrapper whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: song.content }}
          />
        </div>

        {/* Footer Section */}
        <div className="flex justify-between text-sm text-gray-500">
          <div className="space-x-4">
            <span>Created: {new Date(song.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(song.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
