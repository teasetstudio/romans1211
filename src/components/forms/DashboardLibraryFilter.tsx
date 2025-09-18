'use client'

import { ILibraryCatalogSearchParams } from '@/types/Params'
import { IconSearch } from '@/res/icons'
import { useRouter, usePathname } from '@/i18n/routing'
import { FormEvent, useState, useEffect } from 'react'
import { NAMESPACE_DASHBOARD } from '@/res/namespaces'
import { useTranslations } from 'next-intl'
import { IconX } from '@tabler/icons-react'

interface IProps {
  searchParams: ILibraryCatalogSearchParams
  className?: string
}

const DashboardLibraryFilter = ({ searchParams, className }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  const { type, 'search-term': searchTerm, tags, originalOnly = "true" } = searchParams
  const router = useRouter()
  const pathname = usePathname()

  // State for form inputs
  const [search, setSearch] = useState(searchTerm || '')
  const [materialType, setMaterialType] = useState(type || '')
  const [tagInput, setTagInput] = useState(tags || '')
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagTerm, setTagTerm] = useState('')
  const [isOriginalOnly, setIsOriginalOnly] = useState(originalOnly === 'true')

  // Update state when props change
  useEffect(() => {
    setSearch(searchTerm || '')
    setMaterialType(type || '')
    setTagInput(tags || '')
    setSelectedTags(parseTags(tags || ''))
    setTagTerm('')
    setIsOriginalOnly(originalOnly === 'true')
  }, [searchTerm, type, tags, originalOnly])

  // Helpers for comma-separated tags
  const parseTags = (value: string): string[] =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

  // current term is kept separately in tagTerm

  const addTag = (tag: string) => {
    const list = selectedTags
    const exists = new Set(list.map((t) => t.toLowerCase()))
    if (!tag.trim()) return
    if (exists.has(tag.toLowerCase())) {
      // ensure formatting remains consistent
      setTagInput(list.join(','))
      return
    }
    const next = [...list, tag.trim()]
    setSelectedTags(next)
    setTagInput(next.join(','))
  }

  const removeTag = (tag: string) => {
    const next = selectedTags.filter((t) => t.toLowerCase() !== tag.toLowerCase())
    setSelectedTags(next)
    setTagInput(next.join(','))
  }

  // Debounced fetch for tag suggestions based on the current term being typed
  useEffect(() => {
    const controller = new AbortController()
    const q = tagTerm.trim()

    if (!q) {
      setTagSuggestions([])
      return
    }

    const handle = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true)
        const res = await fetch(`/api/tags?searchText=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load suggestions')
        const data: unknown = await res.json()
        const names: string[] = Array.isArray(data)
          ? (data as unknown[])
              .map((item) => {
                if (typeof item === 'string') return item
                if (item && typeof item === 'object' && 'name' in item) {
                  const n = (item as { name?: unknown }).name
                  return typeof n === 'string' ? n : undefined
                }
                return undefined
              })
              .filter((v): v is string => typeof v === 'string')
          : []

        const lowerQ = q.toLowerCase()
        const already = new Set(selectedTags.map((t) => t.toLowerCase()))
        const filtered = names
          .filter((n) => typeof n === 'string')
          .filter((n) => n.toLowerCase().startsWith(lowerQ))
          .filter((n) => !already.has(n.toLowerCase()))
          .filter((n, idx, arr) => arr.indexOf(n) === idx)
          .slice(0, 8)
        setTagSuggestions(filtered)
      } catch (e: unknown) {
        const isAbort = typeof e === 'object' && e !== null && 'name' in e && (e as { name?: unknown }).name === 'AbortError'
        if (!isAbort) setTagSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 250)

    return () => {
      controller.abort()
      clearTimeout(handle)
    }
  }, [tagTerm, selectedTags])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()

    // Add non-empty values to params
    if (search) params.append('search-term', search)
    if (materialType) params.append('type', materialType)
    if (tagInput) params.append('tags', tagInput)
    if (!isOriginalOnly) params.append('originalOnly', 'false')

    // Reset to page 1 when filter changes
    params.set('page', '1')

    // Navigate with new params
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Original Only Checkbox */}
        <div className="flex items-center ml-1">
          <input
            type="checkbox"
            id="originalOnly"
            name="originalOnly"
            checked={isOriginalOnly}
            onChange={(e) => setIsOriginalOnly(e.target.checked)}
            className="w-3 h-3 text-primary border-gray-200 rounded focus:ring-primary cursor-pointer"
          />
          <label htmlFor="originalOnly" className="ml-2 text-gray-700 cursor-pointer select-none text-sm">
            {t('filter-panel.original_only')}
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <input
                type="text"
                name="search-term"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`${t('search_materials')}...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Material Type Select */}
          <div className="w-[180px]">
            <select
              name="type"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="">{t('all_materials')}</option>
              <option value="text">{t('texts')}</option>
              <option value="song">{t('songs')}</option>
              <option value="game">{t('games')}</option>
            </select>
          </div>

          {/* Tags Input */}
          <div className="w-[270px] relative">
            <div className="flex flex-wrap items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              {/* Chips */}
              {selectedTags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                  {t}
                  <button
                    type="button"
                    className="hover:bg-primary/20 rounded-full p-0.5"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove ${t}`}
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {/* Text input shows only current term */}
              <input
                type="text"
                name="tags"
                value={tagTerm}
                onChange={(e) => setTagTerm(e.target.value)}
                onKeyDown={(e) => {
                  const term = tagTerm
                  if ((e.key === 'Enter' || e.key === ',') && term.trim()) {
                    e.preventDefault()
                    addTag(term.trim())
                    // clear current term
                    setTagTerm('')
                    setTagSuggestions([])
                  }
                }}
                placeholder={t('tags_placeholder')}
                className="flex-1 min-w-[60px] px-1 py-1 outline-none bg-transparent text-gray-800 placeholder-gray-400"
              />
            </div>
            {isLoadingSuggestions && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            )}
            {tagSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                {tagSuggestions.map((s) => (
                  <li
                    key={s}
                    className="px-3 py-2 cursor-pointer hover:bg-primary/5"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      addTag(s)
                      setTagTerm('')
                      setTagSuggestions([])
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('search')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DashboardLibraryFilter
