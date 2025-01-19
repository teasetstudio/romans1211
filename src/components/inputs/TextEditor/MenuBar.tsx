"use client";

import React from "react";
import { Editor } from "@tiptap/react";
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
  IconHighlight,
  IconLink,
  IconSeparator,
} from "@tabler/icons-react";
import { IconParagraph, IconRedo, IconUndo } from '@/res/icons'

import { MobileMenuBar } from "./MobileMenuBar";
import { Divider, MenuButton } from "./components";

const MenuBar = ({ editor, onAddLink }: { editor: Editor; onAddLink: () => void }) => {
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
    return <MobileMenuBar editor={editor} onAddLink={onAddLink} />;
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
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <IconUnderline size={18} />
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
        <div className="relative">
          <MenuButton
            onClick={onAddLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <IconLink size={18} />
          </MenuButton>
        </div>
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

export default MenuBar
