"use client"

import { EditorContent, useEditor } from '@tiptap/react'

import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import React from 'react'

import '@/styles/tiptap-components.css';
import './tiptap.css'
import LinkMenu, { TLinkData } from './LinkMenu'
import MenuBar from './MenuBar'
import { getLinkDataFromPos } from './logic/utils'

interface TextEditorProps {
  content: string
  onChange: (value: string) => void
}

const TextEditor = ({ content, onChange }: TextEditorProps) => {
  const [linkMenuOpen, setLinkMenuOpen] = React.useState(false)
  const [clickLinkData, setClickLinkData] = React.useState<TLinkData | null>(null)

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
      Link.configure({
        openOnClick: false,
        shouldAutoLink: (url) => url.startsWith('https://'),
        HTMLAttributes: {
          class: 'cursor-pointer',
        },
      }),
      Underline,
    ],
    content,
    editorProps: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handleClick(view, pos, event) {
        const linkData = getLinkDataFromPos(view, pos)

        const isClickPositionIsALink = !linkData.isCreatingLink
        if (isClickPositionIsALink) {
          setClickLinkData(linkData)
          setLinkMenuOpen(true)
        } else {
          setLinkMenuOpen(false)
        }

        return true // Prevent other click handling
      },
    },
  })

  const handleAddLink = () => {
    if (editor) {
      const pos = editor.state.selection.from
      const linkData = getLinkDataFromPos(editor.view, pos)
      setClickLinkData(linkData)
      setLinkMenuOpen(true)
    }
  }

  if (!editor) return null

  return (
    <div className="tiptap-wrapper flex flex-col h-auto">
      <div className="sticky top-0 z-10">
        <MenuBar editor={editor} onAddLink={handleAddLink} />
      </div>

      <div className="flex-grow min-h-[300px]">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none min-h-[200px] focus:outline-none [&_.ProseMirror]:focus:outline-none [&_ul]:list-disc [&_ul]:pl-[40px] [&_ol]:list-decimal [&_ol]:pl-[40px]"
        />
      </div>
      <LinkMenu
        editor={editor}
        isOpen={linkMenuOpen}
        setIsOpen={setLinkMenuOpen}
        clickLinkData={clickLinkData}
      />
    </div>
  )
}

export default TextEditor
