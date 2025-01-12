'use client';

import React from 'react';
import TextEditor from '../inputs/TextEditor';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useTranslations } from 'next-intl';

interface SongMaterialFormProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export default function SongMaterialForm({
  title,
  content,
  onTitleChange,
  onContentChange,
}: SongMaterialFormProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          {t('form.title')}
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('form.title_song_placeholder')}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('form.content')}
        </label>
        <TextEditor content={content} onChange={onContentChange} />
      </div>
    </div>
  );
}
