'use client';

import { useState } from 'react';
import { Listbox, ListboxOptions, ListboxOption, ListboxButton, Switch } from '@headlessui/react';
import clsx from 'clsx';
import Link from 'next/link';
import { IconCheck } from '@/res/icons';
import TabGroup from '../tabs/TabGroup';
import TextMaterialForm from './TextMaterialForm';
import SongMaterialForm from './SongMaterialForm';
import GameMaterialForm from './GameMaterialForm';
import MaterialTypeBadge from '../badges/MaterialTypeBadge';

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'ru', name: 'Russian' },
  { id: 'lt', name: 'Lithuanian' },
];

const MATERIAL_TYPES = [
  { id: 'text', label: 'Text Material' },
  { id: 'song', label: 'Song' },
  { id: 'game', label: 'Game' },
] as const;

interface MaterialFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    language?: string;
    isPublic: boolean;
    tags?: string[];
    organizationId: string;
    type?: 'text' | 'song' | 'game';
  };
  onSubmit: (data: {
    title: string;
    content: string;
    language: string;
    isPublic: boolean;
    tags: string[];
    organizationId: string;
    type: 'text' | 'song' | 'game';
  }) => Promise<void>;
  cancelHref?: string;
  editType?: 'text' | 'song' | 'game';
  submitLabel?: string;
}

export default function MaterialForm({
  initialData = {
    title: '123',
    content: '<p>Description here.</p>',
    language: 'en',
    isPublic: false,
    tags: [],
    organizationId: '',
    type: 'text' as const,
  },
  onSubmit,
  editType,
  cancelHref,
  submitLabel = 'Save',
}: MaterialFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [language, setLanguage] = useState(
    LANGUAGES.find((lang) => lang.id === initialData.language) || LANGUAGES[0]
  );
  const [isPublic, setIsPublic] = useState(initialData.isPublic);
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'song' | 'game'>(initialData.type || 'text');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    if (content.length < 3) {
      setError('Content must be at least 3 characters long');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        title,
        content,
        language: language.id,
        isPublic,
        tags,
        organizationId: initialData.organizationId,
        type: activeTab,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {initialData.id ? 'Edit Material' : 'Create New Material'}
        </h1>
        {cancelHref && (
          <Link href={cancelHref} className="text-blue-600 hover:text-blue-700">
            Cancel
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>
      )}



      {editType ?
        <>
          <MaterialTypeBadge type={editType} />
          {editType === 'text' ? (
            <TextMaterialForm
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
            />
          ) : editType === 'song' ? (
            <SongMaterialForm
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
            />
          ) : (
            <GameMaterialForm
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
            />
          )}
        </>
        :
        <TabGroup
          tabs={MATERIAL_TYPES}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as 'text' | 'song' | 'game')}
        >
          {activeTab === 'text' ? (
            <TextMaterialForm
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
            />
          ) : activeTab === 'song' ? (
            <SongMaterialForm
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
            />
          ) : (
            <GameMaterialForm
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
            />
          )}
        </TabGroup>

      }



      <div className="flex items-center space-x-4">
        <Listbox value={language} onChange={setLanguage}>
          <div className="relative w-48">
            <ListboxButton className="w-full p-2 text-left border rounded-md">
              {language.name}
            </ListboxButton>
            <ListboxOptions className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50">
              {LANGUAGES.map((lang) => (
                <ListboxOption
                  key={lang.id}
                  value={lang}
                  className="group cursor-pointer select-none p-2 flex items-center gap-2 data-[focus]:outline-red/25"
                >
                  <IconCheck className="invisible size-4 fill-white text-gray-500 group-data-[selected]:visible h-6 w-6" />
                  <div>{lang.name}</div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>

        <div className="flex items-center space-x-2">
          <Switch
            checked={isPublic}
            onChange={setIsPublic}
            className={clsx(
              'relative inline-flex h-6 w-11 items-center rounded-full',
              isPublic ? 'bg-blue-600' : 'bg-gray-200'
            )}
          >
            <span
              className={clsx(
                'inline-block h-4 w-4 transform rounded-full bg-white transition',
                isPublic ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </Switch>
          <span>Public</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags (press Enter)"
          className="border w-full p-2 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={clsx(
          'px-4 py-2 bg-blue-600 text-white rounded-md transition-colors',
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        )}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
