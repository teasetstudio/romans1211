'use client';

import { useEffect, useState } from 'react';
import { Listbox, ListboxOptions, ListboxOption, ListboxButton, Switch, Label, Field } from '@headlessui/react';
import clsx from 'clsx';
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { IconCheck, IconChevronDown, IconX, IconLanguage, IconWorld, IconTag } from '@tabler/icons-react';
import TabGroup from '../tabs/TabGroup';
import TextMaterialForm from './TextMaterialForm';
import SongMaterialForm from './SongMaterialForm';
import GameMaterialForm, { GamePreparation } from './GameMaterialForm';
import MaterialTypeBadge from '../badges/MaterialTypeBadge';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useTranslations } from 'next-intl';

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'lt', name: 'Lithuanian' },
  { id: 'ru', name: 'Russian' },
  { id: 'pl', name: 'Polish' },
];

const MATERIAL_TYPES = [
  { id: 'text', label: 'Text Material' },
  { id: 'song', label: 'Song' },
  { id: 'game', label: 'Game' },
] as const;

export interface ISubmitData {
  title: string;
  content: string;
  language: string;
  isPublic: boolean;
  tags: string[];
  organizationId: string;
  type: 'text' | 'song' | 'game';
  preparations?: GamePreparation[];
}

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
    preparations?: GamePreparation[];
  };
  onSubmit: (data: ISubmitData) => Promise<void>;
  cancelHref?: string;
  editType?: 'text' | 'song' | 'game';
  submitLabel?: string;
  formTitle?: string;
}

export default function MaterialForm({
  initialData = {
    title: '',
    content: '<p></p>',
    language: 'en',
    isPublic: false,
    tags: [],
    organizationId: '',
    type: 'text' as const,
    preparations: [],
  },
  onSubmit,
  editType,
  cancelHref,
  submitLabel: submitLabelProp,
  formTitle,
}: MaterialFormProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  const submitLabel = submitLabelProp ? submitLabelProp : initialData.id ? t('save_changes') : t('create_material');

  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [language, setLanguage] = useState(
    LANGUAGES.find((lang) => lang.id === initialData.language) || LANGUAGES[0]
  );
  const [isPublic, setIsPublic] = useState(initialData.isPublic);
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'song' | 'game'>(initialData.type || 'text');
  const [preparations, setPreparations] = useState<GamePreparation[]>(initialData.preparations || []);

  // Debounced fetch for tag suggestions
  useEffect(() => {
    const controller = new AbortController();
    const q = tagInput.trim();

    if (!q) {
      setTagSuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);
        const res = await fetch(`/api/tags?searchText=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to load suggestions');
        const data: unknown = await res.json();
        // Normalize to string[] of tag names using type guards
        const names: string[] = Array.isArray(data)
          ? (data as unknown[])
              .map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object' && 'name' in item) {
                  const n = (item as { name?: unknown }).name;
                  return typeof n === 'string' ? n : undefined;
                }
                return undefined;
              })
              .filter((v): v is string => typeof v === 'string')
          : [];
        // Ensure startsWith (case-insensitive), exclude already selected tags, unique, limit 8
        const lowerQ = q.toLowerCase();
        const filtered = names
          .filter((n) => n && typeof n === 'string')
          .filter((n) => n.toLowerCase().startsWith(lowerQ))
          .filter((n) => !tags.includes(n))
          .filter((n, idx, arr) => arr.indexOf(n) === idx)
          .slice(0, 8);
        setTagSuggestions(filtered);
      } catch (e: unknown) {
        const isAbort = typeof e === 'object' && e !== null && 'name' in e && (e as { name?: unknown }).name === 'AbortError';
        if (!isAbort) {
          // swallow errors silently for suggestions
          setTagSuggestions([]);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [tagInput, tags]);

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
        ...(activeTab === 'game' && { preparations }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          {formTitle? formTitle : initialData.id ? t('edit_material') : t('create_new_material')}
        </h1>
        {cancelHref && (
          <Link
            href={cancelHref}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('cancel')}
          </Link>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <IconX className="size-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Material Type Selection */}
      {editType ? (
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
              preparations={preparations}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onPreparationsChange={setPreparations}
            />
          )}
        </>
      ) : (
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
              preparations={preparations}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onPreparationsChange={setPreparations}
            />
          )}
        </TabGroup>
      )}

      {/* Settings Section */}
      <div className="space-y-6 bg-gray-50 p-2 sm:p-6 rounded-lg border border-gray-300">
        <h2 className="text-lg font-semibold text-gray-900">{t('form.material_settings')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('form.language')}</label>
            <Listbox value={language} onChange={setLanguage}>
              <div className="relative">
                <ListboxButton className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <span className="flex items-center gap-2">
                    <IconLanguage className="size-5 text-gray-500" />
                    {t(`form.language_${language.id}`)}
                  </span>
                  <IconChevronDown className="size-5 text-gray-400" />
                </ListboxButton>
                <ListboxOptions className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  {LANGUAGES.map((lang) => (
                    <ListboxOption
                      key={lang.id}
                      value={lang}
                      className={({ active, selected }) =>
                        clsx(
                          'flex items-center gap-2 px-4 py-2 cursor-pointer',
                          active && 'bg-primary/5',
                          selected && 'bg-primary/10'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <IconCheck
                            className={clsx(
                              'size-5',
                              selected ? 'text-primary' : 'text-transparent'
                            )}
                          />
                          {t(`form.language_${lang.id}`)}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          {/* Visibility Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('form.visibility')}</label>
            <Field>
              <div className="flex items-center gap-4 h-12">
                <div>
                  <Switch
                    checked={isPublic}
                    onChange={setIsPublic}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isPublic ? 'bg-primary' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        isPublic ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </Switch>
                </div>
                <Label className="flex items-center gap-2">
                  <IconWorld className="size-5 text-gray-500" />
                  <span>{t('form.make_public')}</span>
                </Label>
              </div>
            </Field>
          </div>
        </div>

        {/* Tags Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('form.tags')}</label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <IconX className="size-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <IconTag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={t('form.tags_placeholder')}
                className="w-full pl-12 pr-4 py-2 bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {isLoadingSuggestions && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              )}
              {tagSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                  {tagSuggestions.map((s) => (
                    <li
                      key={s}
                      className="px-3 py-2 cursor-pointer hover:bg-primary/5"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (!tags.includes(s)) {
                          setTags([...tags, s]);
                        }
                        setTagInput('');
                        setTagSuggestions([]);
                      }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            'px-6 py-2 text-white bg-primary rounded-lg transition-colors',
            isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          {isSubmitting ? t('form.saving') : submitLabel}
        </button>
      </div>
    </form>
  );
}
