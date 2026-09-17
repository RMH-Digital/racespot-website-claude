'use client'

import { useMemo, useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'
import { formatViewCount } from '@/lib/youtube-utils'
import { getT, localePath, type Lang } from '@/lib/i18n'
import type { CalendarEvent } from '@/lib/sheets'
import { AddToCalendar } from '@/components/sections/calendar/AddToCalendar'
import { eventStatus } from '@/components/sections/calendar/status'

// ─── Types ──────────────────────────────────────────────────

export interface TickerItem {
  /** Display label (already formatted text, e.g. "UPCOMING: …") */
  label: string
  /** Optional ISO 8601 date — when present the Ticker adds localised "Weekday Day Mon · HH:MM" */
  dateISO?: string
  /** The broadcast itself — when present a small calendar menu follows the text */
  event?: CalendarEvent
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

// ─── Reduced motion ─────────────────────────────────────────

const reduceQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)')
const subscribeReduce = (cb: () => void) => {
  const q = reduceQuery()
  q.addEventListener('change', cb)
  return () => q.removeEventListener('change', cb)
}

/**
 * Whether the visitor asked for less motion. The global stylesheet then stops
 * the scrolling strip, which used to leave whatever happened to be at the
 * left edge frozen in place — on an iPhone with "Reduce Motion" on, the
 * ticker looked broken rather than considerate. Instead the strip shows one
 * broadcast at a time and swaps every six seconds: no continuous motion, but
 * every item still gets its turn.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduce, () => reduceQuery().matches, () => false)
}

// ─── Component ──────────────────────────────────────────────

export function Ticker({ lang, items = [] }: TickerProps) {
  const is24h = useIs24Hour()
  const [mounted, setMounted] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const [step, setStep] = useState(0)
  const { liveStreams, isLive, loaded, polledAt } = useLiveStatus()
  const t = getT(lang)

  useEffect(() => { setMounted(true) }, [])

  const rendered = useMemo(() => {
    // Prepend live stream titles from client-side polling
    const liveItems: { text: string; event?: CalendarEvent }[] = liveStreams.map(stream => {
      const viewers = formatViewCount(stream.concurrentViewers)
      return { text: `${stream.title} — ${viewers} ${t('live.watching')}` }
    })

    // A sheet row still inside its window but no longer on air is over — drop
    // it rather than announce a broadcast that has ended. Only once YouTube's
    // answer is in; until then the server's list stands.
    const current = (!items || items.length === 0) ? [] : items.filter(item => {
      if (!item.event || !loaded) return true
      const s = eventStatus(item.event, isLive, polledAt)
      return !s.past
    })
    const serverItems = current.map(item => {
      if (item.dateISO && mounted) {
        const dateStr = formatLocalDate(item.dateISO)
        const timeStr = formatLocalTime(item.dateISO, is24h)
        return { text: `${item.label} — ${dateStr} · ${timeStr}`, event: item.event }
      }
      return { text: item.label, event: item.event }
    })

    return liveItems.length > 0 ? [...liveItems, ...serverItems] : serverItems
  }, [items, is24h, mounted, liveStreams, isLive, loaded, polledAt, t])

  // Step through the items when nothing may scroll (see usePrefersReducedMotion)
  useEffect(() => {
    if (!reducedMotion || rendered.length < 2) return
    const id = setInterval(() => setStep((s) => s + 1), 6000)
    return () => clearInterval(id)
  }, [reducedMotion, rendered.length])

  if (rendered.length === 0) return null

  // Duplicate for seamless infinite scroll
  const duped = [...rendered, ...rendered]
  const single = rendered[step % rendered.length]

  return (
    <div className="pause-on-hover fixed top-16 left-0 right-0 z-40 h-[34px] bg-rs-yellow border-b border-rs-border overflow-hidden flex items-center">
      {/* Status label — LIVE → /live, UPCOMING → /calendar */}
      {isLive ? (
        <Link href={localePath(lang, '/live')} title={t('hero.watchLive')} className="shrink-0 flex items-center gap-1.5 px-3.5 h-full bg-black/15 hover:bg-black/25 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-rs-live animate-pulse-live" />
          <span className="text-[11px] font-display font-bold uppercase text-rs-black">{t('ticker.live')}</span>
        </Link>
      ) : (
        <Link href={localePath(lang, '/calendar')} title={t('hero.viewSchedule')} className="shrink-0 flex items-center px-3.5 h-full bg-black/10 hover:bg-black/20 transition-colors">
          <span className="text-[11px] font-display font-bold uppercase text-rs-black/70">{t('ticker.upcoming')}</span>
        </Link>
      )}

      {/* Scrolling ticker — or, for reduced motion, one item at a time */}
      {reducedMotion ? (
        <div className="flex flex-1 items-center gap-1 overflow-hidden px-3">
          <span key={step} className="truncate text-xs font-medium text-rs-black/85">{single.text}</span>
          {single.event && <AddToCalendar lang={lang} event={single.event} t={t} compact tone="light" />}
        </div>
      ) : (
      <div className="overflow-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap">
          {duped.map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="text-xs font-medium text-rs-black/85 px-1">{item.text}</span>
              {/* The same three-way menu as in the calendar, in the strip's own
                  colours. The strip pauses while it is open (globals.css). */}
              {item.event && <AddToCalendar lang={lang} event={item.event} t={t} compact tone="light" />}
              <span className="text-rs-black/40 mx-6" aria-hidden="true">◆</span>
            </span>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
