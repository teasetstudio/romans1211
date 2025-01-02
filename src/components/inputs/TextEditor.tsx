"use client"

import { EditorContent, useEditor } from '@tiptap/react'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

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
    immediatelyRender: false,
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
    <div className="flex flex-col editor-styles bg-gray-50 rounded-lg p-4 h-auto">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 px-4 pt-4 bg-gray-50">
        <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 p-2">
          <MenuBar editor={editor} />
        </div>
      </div>

      <div className="flex-grow">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}

export default TextEditor

const MenuBar = ({ editor }: any) => {
  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'underline' : ''}>
          H1
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'underline' : ''}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'underline' : ''}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'underline' : ''}>
          Paragraph
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'underline' : ''}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'underline' : ''}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'underline' : ''}>
          Strike
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'underline' : ''}>
          Highlight
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'underline' : ''}>
          Left
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'underline' : ''}>
          Center
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'underline' : ''}>
          Right
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'underline' : ''}>
          Justify
        </button>
      </div>
    </div>
  )
}