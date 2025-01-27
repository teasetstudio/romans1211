'use client'

import { useState } from 'react'
import { IconCopy, IconCheck } from '@/res/icons'

interface IProps {
  isPublic: boolean
  publicUrl?: string
  className?: string
}

export default function VisibilityBadge({ isPublic, publicUrl, className = '' }: IProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = async () => {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isPublic) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        Private
      </span>
    )
  }

  if (!publicUrl) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        Public
      </span>
    )
  }

  return (
    <button
      onClick={handleCopyUrl}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer ${className}`}
    >
      Public
      {copied ? (
        <IconCheck className="w-3 h-3" />
      ) : (
        <IconCopy className="w-3 h-3" />
      )}
    </button>
  )
}
