'use client';

import { Input } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';
import TextEditor from '../inputs/TextEditor';

interface GameMaterialFormProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export default function GameMaterialForm({
  title,
  content,
  onTitleChange,
  onContentChange,
}: GameMaterialFormProps) {
  return (
    <div className="space-y-4">
      <Input as={React.Fragment}>
        {({ focus, hover }: any) => (
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            type="text"
            placeholder="Game Title"
            className={clsx(
              'border w-full p-2 rounded-md',
              focus && 'bg-blue-100',
              hover && 'shadow'
            )}
          />
        )}
      </Input>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Game Description
        </label>
        <TextEditor content={content} onChange={onContentChange} />
      </div>
    </div>
  );
}
