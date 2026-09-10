'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'
import { formatViewCount } from '@/lib/youtube-utils'
import { getT, localePath, type Lang } from '@/lib/i18n'

// ─── Types ──────────────────────────────────────────────────

export interface TickerItem {
  /** Display label (already formatted text, e.g. "UPCOMING: …") */
  label: string
  /** Optional ISO 8601 date — when present the Ticker adds localised "Weekday Day Mon · HH:MM" */
  dateISO?: string
}

interface TickerProps {
  lang: Lang
  items: TickerItem[]
}

// ─── Locale-aware helpers (same logic as CalendarClient) ────

function useIs24Hour(): boolean {
  const [is24h, setIs24h] = useState(true)

  useEffect(() => {
    try {
      const locale = navigator.language || 'en'
      if (locale.startsWith('de')) { setIs24h(true); return }
      const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
      setIs24h(!resolved.hour12)
    } catch {
      setIs24h(false)
    }
  }, [])

  return is24h
}

function formatLocalTime(iso: string, is24h: boolean): string {
  const d = new Date(iso)
  try {
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24h,
    })
  } catch {
    const h = d.getHours()
    const m = String(d.getMinutes()).padStart(2, '0')
    if (is24h) return `${String(h).padStart(2, '0')}:${m}`
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${m} ${ampm}`
  }
}

function formatLocalDate(iso: string): string {
  const d = new Date(iso)
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'
  const weekday = d.toLocaleDateString(locale, { weekday: 'short' })
  const day = d.getDate()
  const month = d.toLocaleDateString(locale, { month: 'short' })
  return `${weekday} ${day} ${month}`
}

// ─── Component ──────────────────────────────────────────────

export function Ticker({ lang, items = [] }: TickerProps) {
  const is24h = useIs24Hour()
  const [mounted, setMounted] = useState(false)
  const { liveStreams, isLive } = useLiveStatus()
  const t = getT(lang)

  useEffect(() => { setMounted(true) }, [])

  const rendered = useMemo(() => {
    // Prepend live stream titles from client-side polling
    const liveItems: string[] = liveStreams.map(stream => {
      const viewers = formatViewCount(stream.concurrentViewers)
      return `${stream.title} — ${viewers} ${t('live.watching')}`
    })

    const serverItems = (!items || items.length === 0) ? [] : items.map(item => {
      if (item.dateISO) {
        if (!mounted) {
          return item.label
        }
        const dateStr = formatLocalDate(item.dateISO)
        const timeStr = formatLocalTime(item.dateISO, is24h)
        return `${item.label} — ${dateStr} · ${timeStr}`
      }
      return item.label
    })

    return liveItems.length > 0 ? [...liveItems, ...serverItems] : serverItems
  }, [items, is24h, mounted, liveStreams, t])

  if (rendered.length === 0) return null

  // Duplicate for seamless infinite scroll
  const duped = [...rendered, ...rendered]

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-[34px] bg-rs-yellow border-b border-rs-border overflow-hidden flex items-center">
      {/* Status label — LIVE → /live, UPCOMING → /calendar */}
      {isLive ? (
        <Link href={localePath(lang, '/live')} className="shrink-0 flex items-center gap-1.5 px-3.5 h-full bg-black/15 hover:bg-black/25 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-rs-live animate-pulse-live" />
          <span className="text-[11px] font-display font-bold uppercase text-rs-black">{t('ticker.live')}</span>
        </Link>
      ) : (
        <Link href={localePath(lang, '/calendar')} className="shrink-0 flex items-center px-3.5 h-full bg-black/10 hover:bg-black/20 transition-colors">
          <span className="text-[11px] font-display font-bold uppercase text-rs-black/70">{t('ticker.upcoming')}</span>
        </Link>
      )}

      {/* Scrolling ticker */}
      <div className="overflow-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap">
          {duped.map((text, i) => (
            <span key={i} className="flex items-center">
              <span className="text-xs font-medium text-rs-black/85 px-1">{text}</span>
              <span className="text-rs-black/40 mx-6">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
