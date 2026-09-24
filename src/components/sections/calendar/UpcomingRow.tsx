'use client'

import Link from 'next/link'
import type { CalendarEvent } from '@/lib/sheets'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { useLocalFormat } from '@/lib/hooks/useLocalTime'
import { AddToCalendar } from './AddToCalendar'
import { useEventStatus } from './status'

/**
 * One announced broadcast as a row: date, series, time — and on the right the
 * same save menu the calendar has (this broadcast, the whole series, the
 * YouTube bell). Jürgen, 2026-09-24: wherever the site announces a stream,
 * it can be saved from there. While it is on air the menu gives way to a
 * link to the live page instead; saving a broadcast that is running already
 * helps nobody.
 *
 * Used by the live page's schedule in both states (on air and offline).
 * "Live" follows the calendar's own rule (useEventStatus): the sheet's window
 * and what YouTube actually reports.
 */
export function UpcomingRow({ lang, event }: { lang: Lang; event: CalendarEvent }) {
  const t = getT(lang)
  const { locale, timeZone, is24h } = useLocalFormat(lang)
  const status = useEventStatus()(event)
  const d = new Date(event.dateISO)

  const fmt = (o: Intl.DateTimeFormatOptions) => {
    try {
      return d.toLocaleString(locale, { ...o, timeZone })
    } catch {
      return ''
    }
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-rs border bg-rs-dark ${status.live ? 'border-rs-live/50' : 'border-rs-border'}`}>
      <div className="shrink-0 text-center min-w-[60px]">
        <p className="text-[11px] uppercase text-rs-muted">{fmt({ weekday: 'short' })}</p>
        <p className="text-xl font-display font-bold text-white">{fmt({ day: 'numeric' })}</p>
        <p className="text-[11px] uppercase text-rs-muted">{fmt({ month: 'short' })}</p>
      </div>

      <div className="w-px h-10 bg-rs-border shrink-0" />

      <div className="flex-1 min-w-0">
        {/* Two lines on a phone rather than "Porsche Club of A…"; one line from sm up, where there is room. */}
        <p className="text-white font-semibold text-sm line-clamp-2 break-words sm:line-clamp-none sm:truncate">{event.series}</p>
        {event.description && <p className="text-rs-muted text-xs truncate">{event.description}</p>}
        <p className="text-rs-yellow text-xs font-display font-bold mt-1 sm:hidden">
          {fmt({ hour: '2-digit', minute: '2-digit', hour12: !is24h })}
        </p>
      </div>

      <p className="hidden sm:block text-rs-yellow text-sm font-display font-bold shrink-0">
        {fmt({ hour: '2-digit', minute: '2-digit', hour12: !is24h })}
      </p>

      {status.live ? (
        <Link
          href={localePath(lang, '/live')}
          data-track="upcoming-watch-live"
          className="shrink-0 flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-rs-live hover:text-white"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rs-live animate-pulse-live" aria-hidden="true" />
          {t('calendar.watch')}
        </Link>
      ) : (
        <AddToCalendar lang={lang} event={event} t={t} />
      )}
    </div>
  )
}
