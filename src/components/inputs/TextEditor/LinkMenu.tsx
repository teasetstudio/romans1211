"use client";

import {
  IconLink,
  IconUnlink,
  IconExternalLink,
  IconCopy,
  IconPencil,
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Editor } from '@tiptap/react'
import React from 'react'

type EditingLink = {
  isCreatingLink: false
  clickPos: number;
  linkStartFrom: number;
  linkEndTo: number;
  linkText: string;
  linkUrl: string;
  menuPosition: { x: number; y: number; };
}
type NewLink = {
  isCreatingLink: true
  clickPos?: never;
  linkStartFrom?: never;
  linkEndTo?: never;
  linkText?: never;
  linkUrl?: never;
  menuPosition: { x: number; y: number; }
}
export type TLinkData = EditingLink | NewLink

interface IProps {
  editor: Editor
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  clickLinkData: TLinkData | null
}

const LinkMenu = ({ editor, isOpen, setIsOpen, clickLinkData }: IProps) => {
  const [url, setUrl] = React.useState('')
  const [label, setLabel] = React.useState('')
  const [isEditing, setIsEditing] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isOpen && clickLinkData) {
      const doesLinkExists = !clickLinkData.isCreatingLink

      // Get the full link text by finding the link node
      let from: number = 0
      let to: number = 0
      let linkText = '', linkUrl = ''
      if (doesLinkExists) {
        from = clickLinkData.linkStartFrom
        to = clickLinkData.linkEndTo
        linkText = clickLinkData.linkText
        linkUrl = clickLinkData.linkUrl
      } else {
        const selectionBoundaries = editor.state.selection
        from = selectionBoundaries.from
        to = selectionBoundaries.to
        linkText = editor.state.doc.textBetween(from, to)
        linkUrl = ''
      }

      setLabel(linkText)
      setUrl(linkUrl)
      setIsEditing(!doesLinkExists)

      if (clickLinkData.menuPosition && menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - clickLinkData.menuPosition.y
        const spaceAbove = clickLinkData.menuPosition.y
        const menuHeight = rect.height

        // Check if menu fits below
        if (spaceBelow >= menuHeight + 10) {
          setMenuPosition({
            top: clickLinkData.menuPosition.y,
            left: Math.max(10, Math.min(clickLinkData.menuPosition.x, window.innerWidth - rect.width - 10))
          })
        }
        // Check if menu fits above
        else if (spaceAbove >= menuHeight + 10) {
          setMenuPosition({
            top: clickLinkData.menuPosition.y - menuHeight,
            left: Math.max(10, Math.min(clickLinkData.menuPosition.x, window.innerWidth - rect.width - 10))
          })
        }
        // Fallback to centered position
        else {
          setMenuPosition({
            top: Math.max(10, window.innerHeight / 2 - menuHeight / 2),
            left: Math.max(10, window.innerWidth / 2 - rect.width / 2)
          })
        }
      } else {
        setMenuPosition(null)
        setIsEditing(false)
      }
    }
  }, [isOpen, editor, clickLinkData])

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsEditing(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  const handleSubmit = () => {
    if (!editor) return

    if (url === '' || !label) {
      editor.commands.unsetLink()
    } else {

      let from: number = 0
      let to: number = 0
      if (clickLinkData && !clickLinkData.isCreatingLink) {
        from = clickLinkData.linkStartFrom
        to = clickLinkData.linkEndTo
      } else {
        const selectionBoundaries = editor.state.selection
        from = selectionBoundaries.from
        to = selectionBoundaries.to
      }

      // First remove the existing link
      editor.commands.setTextSelection({ from, to })
      editor.commands.unsetLink()

      // Replace the text content
      editor.commands.deleteSelection()
      editor.commands.insertContent(label)

      // Then set the new link
      editor.commands.setTextSelection({ from, to: from + label.length })
      editor.commands.setLink({ href: url, target: '_blank' })
    }
    closeMenu()
  }

  const handleUnlink = () => {
    let from: number = 0
    let to: number = 0
    if (clickLinkData && !clickLinkData.isCreatingLink) {
      from = clickLinkData.linkStartFrom
      to = clickLinkData.linkEndTo
    } else {
      const selectionBoundaries = editor.state.selection
      from = selectionBoundaries.from
      to = selectionBoundaries.to
    }

    // First remove the existing link
    editor.commands.setTextSelection({ from, to })
    editor.commands.unsetLink()
    closeMenu()
  }

  const handleOpenLink = () => {
    window.open(url, '_blank')
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  const closeMenu = () => {
    setIsOpen(false)
    setIsEditing(false)
  }

  if (!isOpen) return null


  return (
    <div 
      ref={menuRef}
      style={{
        position: 'fixed',
        top: menuPosition?.top,
        left: menuPosition?.left,
        visibility: menuPosition ? 'visible' : 'hidden'
      }}
      className="z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]"
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {clickLinkData && !clickLinkData.isCreatingLink && (
              <div className="flex items-center gap-2">
                <IconPencil size={16} className="text-gray-500" />
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Link text"
                  className="flex-1 px-2 py-1 text-sm border-b border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <IconLink size={16} className="text-gray-500" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL"
                className="flex-1 px-2 py-1 text-sm border-b border-gray-200 focus:outline-none focus:border-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit()
                  }
                  if (e.key === 'Escape') {
                    setIsOpen(false)
                  }
                }}
              />

              <button
                type="button"
                onClick={handleSubmit}
                className={`p-1 ${!label ? 'text-gray-400 hover:bg-gray-100' : 'text-primary hover:bg-primary/10'}  rounded`}
                disabled={!label}
                title="Apply"
              >
                <IconCheck size={16} />
              </button>
              <button
                type="button"
                onClick={closeMenu}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                title="Cancel"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            // trigger submit without preventDefault OR button type
            type="button"
            onClick={handleOpenLink}
            className="flex items-center gap-2 px-2 py-1 text-sm text-primary hover:bg-gray-50 rounded w-full text-left"
          >
            <IconExternalLink size={16} />
            {url.length > 30 ? `${url.slice(0, 30)}...` : url}
          </button>
          <div className="flex items-center justify-end gap-1 border-t border-gray-100 pt-2">
            <button
              // trigger submit without preventDefault OR button type
              type="button"
              onClick={handleCopyLink}
              className={`p-1.5 text-gray-600 hover:bg-gray-100 rounded ${isCopied ? 'bg-green-200 hover:bg-green-300' : ''}`}
              title="Copy link"
            >
              {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
              title="Edit link"
            >
              <IconPencil size={16} />
            </button>
            <button
              type="button"
              onClick={handleUnlink}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
              title="Remove link"
            >
              <IconUnlink size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkMenu
