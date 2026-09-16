'use client'

import { getT, type Lang } from '@/lib/i18n'
import type { CalendarEvent } from '@/lib/sheets'
import { formatTime, localDate } from './time'

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-rs-live text-white text-[11px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
      LIVE
    </span>
  )
}

export function EmptyState({ lang }: { lang: Lang }) {
  const t = getT(lang)
  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4">📅</div>
      <h3 className="text-rs-white font-display text-lg mb-2">{t('calendar.noEvents')}</h3>
      <p className="text-rs-muted text-sm max-w-md mx-auto">
        {t('calendar.noEventsDesc')}
      </p>
    </div>
  )
}

/**
 * What the hover tip on a broadcast says: the full series name (the grid
 * clamps it to two or three lines), the description, the date and the local
 * start–end, and what a click does. Everything here is also on the page or
 * behind the click — the tip only saves the reader a guess.
 */
export function EventTipContent({ lang, event, is24h, locale, timeZone }: { lang: Lang; event: CalendarEvent; is24h: boolean; locale: string; timeZone?: string }) {
  const t = getT(lang)
  const date = localDate(event.dateISO).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone })
  return (
    <>
      <p className="text-sm font-medium text-white leading-snug">{event.series}</p>
      {event.description && <p className="mt-1 text-rs-muted">{event.description}</p>}
      <p className="mt-2">
        <span className="text-white">{date}</span>
        <span className="mx-1.5 text-rs-muted" aria-hidden="true">·</span>
        <span className="font-bold text-rs-yellow">{formatTime(event.dateISO, is24h, locale, timeZone)}</span>
        <span className="text-rs-muted"> – {formatTime(event.endDateISO, is24h, locale, timeZone)}</span>
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-wider font-display font-bold text-rs-muted">{t('calendar.eventTip')}</p>
    </>
  )
}
