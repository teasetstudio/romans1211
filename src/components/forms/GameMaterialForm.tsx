'use client';

import React, { useState } from 'react';
import TextEditor from '../inputs/TextEditor';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useTranslations } from 'next-intl';
import { IconPlus, IconX, IconGripVertical } from '@tabler/icons-react';

export interface GamePreparation {
  id: string;
  title: string;
  isOptional: boolean;
  order: number;
}

interface GameMaterialFormProps {
  title: string;
  content: string;
  preparations?: GamePreparation[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onPreparationsChange?: (preparations: GamePreparation[]) => void;
}

export default function GameMaterialForm({
  title,
  content,
  preparations = [],
  onTitleChange,
  onContentChange,
  onPreparationsChange,
}: GameMaterialFormProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  const [newPrepTitle, setNewPrepTitle] = useState('');

  const handleAddPreparation = () => {
    if (!newPrepTitle.trim() || !onPreparationsChange) return;
    const highestOrder = preparations.reduce(
      (max, item) => Math.max(max, item.order),
      1
    );
    const newPrep: GamePreparation = {
      id: `prep-${Date.now()}`,
      title: newPrepTitle.trim(),
      isOptional: false,
      order: highestOrder + 1,
    };
    
    onPreparationsChange([...preparations, newPrep]);
    setNewPrepTitle('');
  };

  const handleRemovePreparation = (id: string) => {
    if (!onPreparationsChange) return;
    onPreparationsChange(preparations.filter(prep => prep.id !== id));
  };

  const handleToggleOptional = (id: string) => {
    if (!onPreparationsChange) return;
    onPreparationsChange(
      preparations.map(prep =>
        prep.id === id ? { ...prep, isOptional: !prep.isOptional } : prep
      )
    );
  };

  const handleUpdatePrepTitle = (id: string, newTitle: string) => {
    if (!onPreparationsChange) return;
    onPreparationsChange(
      preparations.map(prep =>
        prep.id === id ? { ...prep, title: newTitle } : prep
      )
    );
  };

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
          placeholder={t('form.title_game_placeholder')}
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

      {/* Preparations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Preparations
          </label>
          <span className="text-xs text-gray-500">
            {preparations.length} item{preparations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Existing Preparations */}
        <div className="space-y-2">
          {preparations.map((prep) => (
            <div key={prep.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center text-gray-400">
                <IconGripVertical className="size-4" />
              </div>
              
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={prep.title}
                  onChange={(e) => handleUpdatePrepTitle(prep.id, e.target.value)}
                  className="w-full px-3 py-1 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Preparation description..."
                />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={prep.isOptional}
                    onChange={() => handleToggleOptional(prep.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Optional
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleRemovePreparation(prep.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <IconX className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Preparation */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPrepTitle}
            onChange={(e) => setNewPrepTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPreparation()}
            placeholder="Add a new preparation..."
            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleAddPreparation}
            disabled={!newPrepTitle.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <IconPlus className="size-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
