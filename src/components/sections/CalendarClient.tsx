'use client'

import { useState, useMemo, useEffect } from 'react'
import { useMediaQuery } from '@/lib/hooks/useLocalTime'
import type { CalendarEvent } from '@/lib/sheets'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { ListView } from './calendar/ListView'
import { CalendarGridView } from './calendar/GridView'
import { EmptyState, LiveBadge } from './calendar/shared'
import { useLocaleFormat, getMonthLabel, getUserTimezone, zonedParts } from './calendar/time'
import { SubscribeButton } from './calendar/SubscribeButton'
import { Tip } from '@/components/ui/Tip'

// ─── Main Calendar Component ────────────────────────────────

type ViewMode = 'list' | 'calendar'

export function CalendarClient({ lang, events }: { lang: Lang; events: CalendarEvent[] }) {
  const isNarrow = useMediaQuery('(max-width: 767px)')
  const [chosenView, setChosenView] = useState<ViewMode | null>(null)
  const viewMode: ViewMode = chosenView ?? (isNarrow ? 'list' : 'calendar')
  const setViewMode = setChosenView
  const { locale, is24h, timeZone, mounted } = useLocaleFormat(lang)

  // The month to open on is itself timezone-dependent: at 23:30 UTC on the last
  // of a month it is already the next month in Berlin. Start from UTC so server
  // and first client render agree, then correct once mounted.
  const utcNow = zonedParts(new Date(), 'UTC')
  const [calYear, setCalYear] = useState(utcNow.year)
  const [calMonth, setCalMonth] = useState(utcNow.month)

  useEffect(() => {
    const local = zonedParts(new Date(), undefined)
    if (local.year !== utcNow.year || local.month !== utcNow.month) {
      setCalYear(local.year)
      setCalMonth(local.month)
    }
    // Only on mount — afterwards the visitor drives the month with the arrows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Shown as a label; must stay stable until mount for the same reason.
  const timezone = mounted ? getUserTimezone() : 'UTC'
  const t = getT(lang)

  const liveEvents = useMemo(() => events.filter(e => e.isLive), [events])

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear(y => y - 1)
    } else {
      setCalMonth(m => m - 1)
    }
  }
  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear(y => y + 1)
    } else {
      setCalMonth(m => m + 1)
    }
  }

  const monthLabel = (m: number) => new Date(calYear, m, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Live Now banner */}
      {liveEvents.length > 0 && (
        <div className="mb-8 p-4 rounded-rs border border-rs-live/30 bg-rs-live/5">
          <div className="flex items-center gap-2 mb-2">
            <LiveBadge />
            <span className="text-xs text-rs-muted">
              {liveEvents.length} {t('calendar.liveNow')}
            </span>
          </div>
          {liveEvents.map(e => (
            <a
              key={e.id}
              href={localePath(lang, '/live')}
              className="flex items-center justify-between py-1.5 hover:text-rs-yellow transition-colors"
            >
              <span className="text-rs-white text-sm font-medium">{e.series}</span>
              <span className="text-xs text-rs-yellow font-display font-bold uppercase">{t('calendar.watch')}</span>
            </a>
          ))}
        </div>
      )}

      {/* Controls bar. From xl up, three columns so the month sits in the exact
          centre whatever the two outer groups weigh. Below that the month gets a
          centred row of its own on top — the Spanish subscribe button and a
          three-hundred-pixel month box do not share a row at 1024. */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr]">
        {/* View toggle, with the timezone beside it — the two quiet controls
            share the left so the right holds only the subscribe button, which in
            Spanish is wide enough to need the room. */}
        <div className="flex items-center gap-4">
        <div className="flex items-center bg-rs-dark border border-rs-border rounded-rs overflow-hidden">
          <button
            onClick={() => setViewMode('calendar')}
            className={`min-h-11 px-4 py-2 text-xs font-display font-bold uppercase tracking-wider transition-colors
              ${viewMode === 'calendar' ? 'bg-rs-yellow text-rs-black' : 'text-rs-muted hover:text-white'}`}
          >
            {t('calendar.calendarView')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`min-h-11 px-4 py-2 text-xs font-display font-bold uppercase tracking-wider transition-colors
              ${viewMode === 'list' ? 'bg-rs-yellow text-rs-black' : 'text-rs-muted hover:text-white'}`}
          >
            {t('calendar.listView')}
          </button>
        </div>
        <Tip content={t('calendar.timezoneNote')} width={240}>
          <div className="flex items-center gap-1.5 text-[11px] text-rs-muted">
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="8" cy="8" r="6.25" />
              <path d="M8 4.5V8l2.25 1.5" strokeLinecap="round" />
            </svg>
            {timezone.replace(/_/g, ' ')}
          </div>
        </Tip>
        </div>

        {/* Month nav — always visible for both views, centred */}
        <div className="order-first flex w-full items-center justify-center gap-3 xl:order-none xl:w-auto xl:justify-self-center">
          <button
            onClick={prevMonth}
            aria-label={t('calendar.prevMonth')}
            title={t('calendar.prevMonth')}
            className="w-11 h-11 flex items-center justify-center rounded-rs border border-rs-border text-rs-muted hover:text-white hover:border-rs-yellow transition-colors"
          >
            <span aria-hidden="true">←</span>
          </button>
          {/* Every month of the year is laid into the same grid cell, the eleven
              that are not showing kept invisible — so the box is as wide as the
              widest month name in this language ("septiembre de 2026" runs a
              third longer than "mayo de 2026"), and the arrows never move while
              someone clicks through the year. */}
          <span className="grid text-sm font-display font-bold text-white text-center whitespace-nowrap" aria-live="polite">
            {Array.from({ length: 12 }, (_, m) => (
              <span
                key={m}
                className={`[grid-area:1/1] ${m === calMonth ? '' : 'invisible'}`}
                aria-hidden={m === calMonth ? undefined : true}
              >
                {monthLabel(m)}
              </span>
            ))}
          </span>
          <button
            onClick={nextMonth}
            aria-label={t('calendar.nextMonth')}
            title={t('calendar.nextMonth')}
            className="w-11 h-11 flex items-center justify-center rounded-rs border border-rs-border text-rs-muted hover:text-white hover:border-rs-yellow transition-colors"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* The schedule subscription, right-aligned */}
        <div className="ml-auto flex items-center xl:ml-0 xl:justify-self-end">
          <SubscribeButton t={t} />
        </div>
      </div>

      {/* View content */}
      {viewMode === 'list' ? (
        <ListView lang={lang} events={events} year={calYear} month={calMonth} is24h={is24h} locale={locale} timeZone={timeZone} />
      ) : (
        <CalendarGridView lang={lang} events={events} year={calYear} month={calMonth} is24h={is24h} locale={locale} timeZone={timeZone} />
      )}

      {/* Footer */}
      {events.length > 0 && (
        <div className="mt-10 pt-5 border-t border-rs-border">
          <p className="text-rs-muted text-xs text-center">
            {t('calendar.timezoneNote')} ({timezone.replace(/_/g, ' ')})
          </p>
        </div>
      )}
    </div>
  )
}
