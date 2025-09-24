"use client"
import H2 from '@/components/typo/H2'
import H8 from '@/components/typo/H8'
import H9 from '@/components/typo/H9'
import { useTranslations } from 'next-intl'
import { NAMESPACE_WIDGETS } from '@/res/namespaces'
import { SubmitFormListener } from './SubmitFormListener'
import { ILibraryCatalogSearchParams } from '@/types/Params'
import { IconSearch } from '@/res/icons'
import { useEffect, useState } from 'react'
import { IconX } from '@tabler/icons-react'

interface IProps {
  searchParams: ILibraryCatalogSearchParams
  className?: string
}

const LibraryCatalogFilter = ({ searchParams, className }: IProps) => {
  const t = useTranslations(NAMESPACE_WIDGETS)
  const { type, 'search-term': searchTerm, tags } = searchParams
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagTerm, setTagTerm] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // initialize from searchParams
  useEffect(() => {
    const initial = (tags || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    setSelectedTags(initial)
    setTagTerm('')
  }, [tags])

  // Tag helpers
  const addTag = (tag: string) => {
    const t = tag.trim()
    if (!t) return
    const exists = new Set(selectedTags.map((x) => x.toLowerCase()))
    if (exists.has(t.toLowerCase())) return
    const next = [...selectedTags, t]
    setSelectedTags(next)
  }

  const removeTag = (tag: string) => {
    const next = selectedTags.filter((x) => x.toLowerCase() !== tag.toLowerCase())
    setSelectedTags(next)
  }

  // Debounced suggestions for tags based on tagTerm
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
      } catch {
        setTagSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 250)

    return () => {
      controller.abort()
      clearTimeout(handle)
    }
  }, [tagTerm, selectedTags])

  return (
    <div className={className}>
      <div className="container">
        <SubmitFormListener />
        <div className="bg-gradient-to-br from-gray5 to-gray5/95 border border-gray3 rounded-3xl backdrop-blur-sm shadow-lg">
          <div className="sm:px-8 sm:py-6 p-6">
            <div className="flex flex-col mb-6">
              <H2 color="text-secondary" className="mb-2">{t('catalog_filter.title')}</H2>
              <H8 weight="medium" color="text-gray1">{t('catalog_filter.subtitle')}</H8>
            </div>

            <form id="library-catalog-form" className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-1/4 relative">
                  <label className="block mb-2">
                    <H9 color="text-gray2" className="font-medium">{t('catalog_filter.material_type')}</H9>
                  </label>
                  <select
                    name="type"
                    defaultValue={type}
                    className="w-full px-4 py-3 bg-white/10 border border-gray3 rounded-xl text-gray1 placeholder-gray2 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer [&>option]:bg-gray5 [&>option]:text-gray1 [&>option]:py-3 [&>option]:px-4 [&>option]:cursor-pointer [&>option]:border-0"
                  >
                    <option value="" className="border-b border-gray3">{t('catalog_filter.all_materials')}</option>
                    <option value="text" className="border-b border-gray3">{t('catalog_filter.texts')}</option>
                    <option value="song" className="border-b border-gray3">{t('catalog_filter.songs')}</option>
                    <option value="game">{t('catalog_filter.games')}</option>
                  </select>
                  <div className="absolute right-4 top-[45px] -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div className="lg:w-2/4">
                  <label className="block mb-2">
                    <H9 color="text-gray2" className="font-medium">{t('catalog_filter.search')}</H9>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="search-term"
                      defaultValue={searchTerm}
                      placeholder={t('catalog_filter.search_materials')}
                      className="w-full pl-11 pr-4 py-3 bg-white/10 border border-gray3 rounded-xl text-gray1 placeholder-gray2 focus:outline-none focus:border-primary transition-colors"
                    />
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray2" />
                  </div>
                </div>

                <div className="lg:w-2/4">
                  <label className="block mb-2">
                    <H9 color="text-gray2" className="font-medium">{t('catalog_filter.tags')}</H9>
                  </label>
                  <div className="relative">
                    {/* Hidden input to submit selected tags */}
                    <input type="hidden" name="tags" value={selectedTags.join(',')} />
                    <div className="w-full px-2 py-2 bg-white/10 border border-gray3 rounded-xl text-gray1 focus-within:border-primary">
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedTags.map((t) => (
                          <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                            {t}
                            <button
                              type="button"
                              className="hover:bg-primary/30 rounded-full p-0.5"
                              onClick={() => removeTag(t)}
                              aria-label={`Remove ${t}`}
                            >
                              <IconX className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={tagTerm}
                          onChange={(e) => setTagTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ',') && tagTerm.trim()) {
                              e.preventDefault()
                              addTag(tagTerm)
                              setTagTerm('')
                              setTagSuggestions([])
                            }
                          }}
                          placeholder={t('catalog_filter.tags_placeholder')}
                          className="flex-1 min-w-[120px] bg-transparent outline-none text-gray1 placeholder-gray2 py-1 px-1"
                        />
                      </div>
                    </div>
                    {isLoadingSuggestions && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    )}
                    {tagSuggestions.length > 0 && (
                      <ul className="absolute z-50 left-0 right-0 mt-2 bg-gray5 border border-gray3 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {tagSuggestions.map((s) => (
                          <li
                            key={s}
                            className="px-4 py-2 cursor-pointer hover:bg-white/10 text-gray1"
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
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  {t('catalog_filter.apply_filters')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LibraryCatalogFilter
