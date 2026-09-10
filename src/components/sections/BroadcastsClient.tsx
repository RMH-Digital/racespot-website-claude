'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import type { YouTubePlaylist } from '@/lib/youtube-utils'
import { getT, type Lang } from '@/lib/i18n'

// ─── Types ──────────────────────────────────────────────────

export interface PlaylistWithMeta extends YouTubePlaylist {
  tier: number
  family: string
  isPrimary: boolean
}

interface BroadcastsClientProps {
  lang: Lang
  playlists: PlaylistWithMeta[]
  families: string[]
}

// ─── Constants ──────────────────────────────────────────────

const INITIAL_COUNT = 12

// ─── Component ──────────────────────────────────────────────

export function BroadcastsClient({ lang, playlists, families }: BroadcastsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [selectedFamilies, setSelectedFamilies] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const t = getT(lang)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isSearching = searchQuery.trim().length > 0
  const isFiltering = selectedFamilies.size > 0

  // Filter + sort logic
  const displayed = useMemo(() => {
    let items = [...playlists]

    // Apply search filter
    if (isSearching) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    }

    // Apply family filter
    if (isFiltering) {
      items = items.filter((p) => selectedFamilies.has(p.family))
    }

    // When filtering or searching, show all results (no primary/secondary split)
    if (isSearching || isFiltering) return items

    // Default view: primaries first (sorted by tier), then secondaries
    const primaries = items.filter((p) => p.isPrimary)
    const secondaries = items.filter((p) => !p.isPrimary)
    return [...primaries, ...secondaries]
  }, [playlists, searchQuery, isSearching, selectedFamilies, isFiltering])

  // Determine visible items
  const activeFilters = isSearching || isFiltering
  const visible = activeFilters || showAll
    ? displayed
    : displayed.slice(0, INITIAL_COUNT)
  const hasMore = !activeFilters && !showAll && displayed.length > INITIAL_COUNT
  const hiddenCount = displayed.length - INITIAL_COUNT

  // Toggle a family in the filter
  function toggleFamily(family: string) {
    setSelectedFamilies((prev) => {
      const next = new Set(prev)
      if (next.has(family)) next.delete(family)
      else next.add(family)
      return next
    })
    setShowAll(false)
  }

  function clearFilters() {
    setSelectedFamilies(new Set())
    setSearchQuery('')
    setShowAll(false)
  }

  return (
    <div>
      {/* Header with search + filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-2">{t('broadcastsPage.fullLibrary')}</p>
          <h2 className="section-title">{t('broadcastsPage.seriesPlaylists')}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter dropdown */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 bg-rs-dark border rounded-rs px-3.5 py-2.5 text-sm transition-colors ${
                isFiltering
                  ? 'border-rs-yellow text-rs-yellow'
                  : 'border-rs-border text-rs-muted hover:border-rs-yellow/50 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">{t('broadcastsPage.filter')}</span>
              {isFiltering && (
                <span className="bg-rs-yellow text-rs-black text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center leading-none min-w-[18px] min-h-[18px]">
                  {selectedFamilies.size}
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-rs-dark border border-rs-border rounded-rs shadow-xl z-50 max-h-[360px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-rs-border shrink-0">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-rs-muted">
                    Filter by Series
                  </span>
                  {isFiltering && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] text-rs-yellow hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Scrollable list */}
                <div className="overflow-y-auto flex-1 py-1">
                  {families.map((family) => (
                    <label
                      key={family}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFamilies.has(family)}
                        onChange={() => toggleFamily(family)}
                        className="w-3.5 h-3.5 rounded border-rs-border bg-rs-gray accent-rs-yellow shrink-0"
                      />
                      <span className="text-sm text-white truncate">{family}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rs-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowAll(false)
              }}
              placeholder={t('broadcastsPage.searchPlaylists')}
              className="w-full bg-rs-dark border border-rs-border rounded-rs pl-10 pr-4 py-2.5
                         text-sm text-white placeholder:text-rs-muted
                         focus:outline-none focus:border-rs-yellow transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Active filter tags */}
      {isFiltering && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {Array.from(selectedFamilies).map((family) => (
            <button
              key={family}
              onClick={() => toggleFamily(family)}
              className="inline-flex items-center gap-1.5 bg-rs-yellow/10 border border-rs-yellow/30 text-rs-yellow text-xs px-2.5 py-1 rounded-rs hover:bg-rs-yellow/20 transition-colors"
            >
              {family}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-rs-muted mb-5">
        {activeFilters
          ? `${displayed.length} playlist${displayed.length !== 1 ? 's' : ''} found`
          : `${playlists.length} playlists`}
      </p>

      {/* Playlist grid */}
      {visible.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-rs-muted text-sm">
            {t('broadcastsPage.noPlaylists')}
          </p>
          <button
            onClick={clearFilters}
            className="text-rs-yellow text-sm mt-2 hover:underline"
          >
            {t('broadcastsPage.clearFilters')}
          </button>
        </div>
      )}

      {/* Show More / Show Less buttons */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="btn-outline btn-sm"
          >
            Show All Playlists ({hiddenCount} more)
          </button>
        </div>
      )}
      {showAll && !activeFilters && displayed.length > INITIAL_COUNT && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setShowAll(false)
              document.getElementById('playlists-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="text-rs-muted text-sm hover:text-rs-yellow transition-colors"
          >
            Show Less
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Playlist Card ──────────────────────────────────────────

function PlaylistCard({ playlist }: { playlist: PlaylistWithMeta }) {
  return (
    <a
      href={`https://www.youtube.com/playlist?list=${playlist.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card-dark overflow-hidden group cursor-pointer block"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-rs-gray">
        {playlist.thumbnailHigh || playlist.thumbnail ? (
          <Image
            src={playlist.thumbnailHigh || playlist.thumbnail}
            alt={playlist.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl text-rs-muted">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Video count badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
          {playlist.itemCount} video{playlist.itemCount !== 1 ? 's' : ''}
        </span>

        {/* Playlist icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-rs-yellow flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-rs-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4zm14-1v6l5-3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-white leading-snug mb-1.5 group-hover:text-rs-yellow transition-colors line-clamp-2">
          {playlist.title}
        </h3>
        {playlist.description && (
          <p className="text-xs text-rs-muted line-clamp-2">
            {playlist.description}
          </p>
        )}
      </div>
    </a>
  )
}
