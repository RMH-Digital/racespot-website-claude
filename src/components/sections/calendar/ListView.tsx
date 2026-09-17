'use client'

import { useMemo, useRef } from 'react'
import type { CalendarEvent } from '@/lib/sheets'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { AddToCalendar } from './AddToCalendar'
import { LiveBadge, EmptyState, EventTipContent, EventLink, ReplayBadge, ReplayOnYouTube, UpNextBadge } from './shared'
import { Tip } from '@/components/ui/Tip'
import { useEventStatus } from './status'
import { localDate, formatTime, formatWeekday, getMonthKey, zonedParts } from './time'

export function ListView({ lang, events, year, month, is24h, locale, timeZone, nextId }: { lang: Lang; events: CalendarEvent[]; year: number; month: number; is24h: boolean; locale: string; timeZone?: string; nextId?: string }) {
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const p = zonedParts(localDate(e.dateISO), timeZone)
      return p.year === year && p.month === month
    })
  }, [events, year, month, timeZone])

  const t = getT(lang)

  if (monthEvents.length === 0) return <EmptyState lang={lang} />

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-rs-border">
        <span className="text-rs-muted text-[11px]">
          {monthEvents.length} {t(monthEvents.length === 1 ? 'calendar.eventOne' : 'calendar.eventMany')}
        </span>
      </div>
      <div>
        {monthEvents.map(event => (
          <EventRow key={event.id} lang={lang} event={event} is24h={is24h} locale={locale} timeZone={timeZone} isNext={event.id === nextId} />
        ))}
      </div>
    </div>
  )
}

function EventRow({ lang, event, is24h, locale, timeZone, isNext = false }: { lang: Lang; event: CalendarEvent; is24h: boolean; locale: string; timeZone?: string; isNext?: boolean }) {
  const menuTrigger = useRef<HTMLButtonElement | null>(null)
  const d = localDate(event.dateISO)
  const day = d.getDate()
  const weekday = formatWeekday(event.dateISO, locale, timeZone)
  const monthStr = d.toLocaleDateString(locale, { month: 'short', timeZone })
  const status = useEventStatus()(event)
  const past = status.past

  const t = getT(lang)
  // One label for every past broadcast — the tip already says whether the
  // click plays the recording here or opens the channel's past streams.
  const hoverLabel = past ? t('calendar.watchReplay') : status.live ? t('calendar.watch') : t('calendar.remind')

  return (
    // A div, not an anchor: the row used to be one link, which left nowhere to
    // put the calendar button — an anchor cannot contain another. The click
    // target is stretched across the row instead, and the button sits above it.
    <Tip content={<EventTipContent lang={lang} event={event} is24h={is24h} locale={locale} timeZone={timeZone} />}>
    <div
      className={`group relative grid grid-cols-[56px_1fr_auto] md:grid-cols-[64px_1fr_auto] gap-4 py-4 px-3 -mx-3
                 hover:bg-rs-dark/60 transition-colors border-b border-rs-border/30 ${past ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      <EventLink lang={lang} event={event} className="absolute inset-0" onOpenMenu={() => menuTrigger.current?.click()} />
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[11px] uppercase text-rs-muted font-medium leading-none">{weekday}</span>
        <span className="text-xl font-display font-bold text-rs-white leading-tight">{day}</span>
        <span className="text-[11px] uppercase text-rs-muted leading-none">{monthStr}</span>
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 flex-wrap">
          {status.live && <LiveBadge />}
          {isNext && !status.live && <UpNextBadge lang={lang} />}
          {past && event.videoId && <ReplayBadge lang={lang} />}
          <p className="text-rs-white font-medium text-sm truncate group-hover:text-rs-yellow transition-colors">
            {event.series}
          </p>
        </div>
        {event.description && (
          <p className="text-rs-muted text-xs mt-0.5 truncate">{event.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[11px] font-bold ${past ? 'text-rs-muted' : 'text-rs-yellow'}`}>{formatTime(event.dateISO, is24h, locale, timeZone)}</span>
          <span className="text-[11px] text-rs-muted" aria-hidden="true">–</span>
          <span className="text-[11px] text-rs-muted">{formatTime(event.endDateISO, is24h, locale, timeZone)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs text-rs-yellow font-display font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          {hoverLabel}
        </span>
        {past
          ? <ReplayOnYouTube lang={lang} videoId={event.videoId} />
          : <AddToCalendar lang={lang} event={event} t={t} triggerRef={menuTrigger} />}
      </div>
    </div>
    </Tip>
  )
}
