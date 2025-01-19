"use client";

import { Editor } from "@tiptap/react";
import { Level } from '@tiptap/extension-heading'
import {
  IconH1,
  IconH2,
  IconH3,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconList,
  IconListNumbers,
  IconQuote,
  IconUnderline,
  IconLink,
} from "@tabler/icons-react";
import { IconParagraph, IconRedo, IconUndo } from '@/res/icons'
import { IconDropdown, MenuButton } from "./components";

export const MobileMenuBar = ({ editor, onAddLink }: { editor: Editor; onAddLink: () => void }) => {
  if (!editor) return null;

  const getCurrentHeadingValue = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('paragraph')) return 'p';
    return 'p';
  };

  const getCurrentAlignValue = () => {
    if (editor.isActive({ textAlign: 'left' })) return 'left';
    if (editor.isActive({ textAlign: 'center' })) return 'center';
    if (editor.isActive({ textAlign: 'right' })) return 'right';
    if (editor.isActive({ textAlign: 'justify' })) return 'justify';
    return 'left';
  };

  const getCurrentFormatValues = (): string[] => {
    const formats: string[] = [];
    if (editor.isActive('bold')) formats.push('bold');
    if (editor.isActive('italic')) formats.push('italic');
    if (editor.isActive('strike')) formats.push('strike');
    if (editor.isActive('underline')) formats.push('underline');
    return formats;
  };

  const headingOptions = [
    { value: 'p', icon: <IconParagraph size={18} /> },
    { value: 'h1', icon: <IconH1 size={18} /> },
    { value: 'h2', icon: <IconH2 size={18} /> },
    { value: 'h3', icon: <IconH3 size={18} /> },
  ];

  const formatOptions = [
    { value: 'bold', icon: <IconBold size={18} /> },
    { value: 'italic', icon: <IconItalic size={18} /> },
    { value: 'strike', icon: <IconStrikethrough size={18} /> },
    { value: 'underline', icon: <IconUnderline size={18} /> },
  ];

  const alignOptions = [
    { value: 'left', icon: <IconAlignLeft size={18} /> },
    { value: 'center', icon: <IconAlignCenter size={18} /> },
    { value: 'right', icon: <IconAlignRight size={18} /> },
    { value: 'justify', icon: <IconAlignJustified size={18} /> },
  ];

  const listOptions = [
    { value: 'bullet', icon: <IconList size={18} /> },
    { value: 'ordered', icon: <IconListNumbers size={18} /> },
    { value: 'quote', icon: <IconQuote size={18} /> },
  ];

  const handleHeadingChange = (value: string) => {
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: parseInt(value[1]) as Level }).run();
    }
  };

  const handleFormatChange = (value: string) => {
    switch (value) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'strike':
        editor.chain().focus().toggleStrike().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
    }
  };

  const handleAlignChange = (value: string) => {
    editor.chain().focus().setTextAlign(value).run();
  };

  const handleListChange = (value: string) => {
    switch (value) {
      case 'bullet':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'ordered':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-white border-b border-primary">
      <IconDropdown
        value={getCurrentHeadingValue()}
        options={headingOptions}
        onChange={handleHeadingChange}
      />

      <IconDropdown
        value={getCurrentFormatValues()}
        options={formatOptions}
        onChange={handleFormatChange}
      />

      <IconDropdown
        value={getCurrentAlignValue()}
        options={alignOptions}
        onChange={handleAlignChange}
      />

      <IconDropdown
        value=""
        options={listOptions}
        onChange={handleListChange}
      />

      <MenuButton
        onClick={onAddLink}
        isActive={editor.isActive('link')}
        title="Add Link"
      >
        <IconLink size={18} />
      </MenuButton>

      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <IconUndo size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <IconRedo size={18} />
        </button>
      </div>
    </div>
  );
};
