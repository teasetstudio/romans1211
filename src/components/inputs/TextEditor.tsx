"use client"

import { Editor, EditorContent, useEditor } from '@tiptap/react'
import { Level } from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'
import React, { JSX } from 'react'
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
  IconHighlight,
  IconList,
  IconListNumbers,
  IconQuote,
  IconSeparator,
} from '@tabler/icons-react'
import { IconParagraph, IconRedo, IconUndo } from '@/res/icons'

import '@/styles/tiptap-components.css';
import './tiptap.css'

interface TextEditorProps {
  content: string
  onChange: (value: string) => void
}

const TextEditor = ({ content, onChange }: TextEditorProps) => {
  const editor = useEditor({
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
    ],
    content,
  })

  if (!editor) return null

  return (
    <div className="tiptap-wrapper flex flex-col h-auto">
      <div className="sticky top-0 z-10 ">
        <MenuBar editor={editor} />
      </div>

      <div className="flex-grow min-h-[300px]">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none min-h-[200px] focus:outline-none [&_.ProseMirror]:focus:outline-none [&_ul]:list-disc [&_ul]:pl-[40px] [&_ol]:list-decimal [&_ol]:pl-[40px]"
        />
      </div>
    </div>
  )
}

export default TextEditor

interface MenuButtonProps {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  title?: string
}

const MenuButton = ({ onClick, isActive, children, title }: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
      isActive ? 'bg-gray-100 text-primary' : 'text-gray-700'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />

const IconDropdown = ({ 
  value, 
  options, 
  onChange, 
  className 
}: { 
  value: string;
  options: { value: string; icon: JSX.Element }[];
  onChange: (value: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
      >
        {options.find(opt => opt.value === value)?.icon || options[0].icon}
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
          <div className="p-1 grid grid-cols-2 gap-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-10 h-10 rounded flex items-center justify-center ${
                  value === option.value
                    ? 'bg-gray-100 text-primary'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MobileMenuBar = ({ editor }: { editor: Editor }) => {
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
        value=""
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

const MenuBar = ({ editor }: {editor: Editor}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 450);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!editor) return null;

  if (isMobile) {
    return <MobileMenuBar editor={editor} />;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-primary rounded-t-lg">
      {/* Text style buttons */}
      <div className="flex items-center gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <IconH1 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <IconH2 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <IconH3 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="Paragraph"
        >
          <IconParagraph size={18} />
        </MenuButton>
      </div>

      <Divider />

      {/* Text formatting buttons */}
      <div className="flex items-center gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <IconBold size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <IconItalic size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <IconStrikethrough size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <IconHighlight size={18} />
        </MenuButton>
      </div>

      <Divider />

      {/* Alignment buttons */}
      <div className="flex items-center gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <IconAlignLeft size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <IconAlignCenter size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <IconAlignRight size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <IconAlignJustified size={18} />
        </MenuButton>
      </div>

      <Divider />

      {/* List buttons */}
      <div className="flex items-center gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <IconList size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <IconListNumbers size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <IconQuote size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <IconSeparator size={18} />
        </MenuButton>
      </div>

      <Divider />

      {/* Undo/Redo buttons */}
      <div className="flex items-center gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <IconUndo size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <IconRedo size={18} />
        </MenuButton>
      </div>
    </div>
  );
};