'use client'

import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CalendarEvent } from '@/lib/sheets'
import { getT, localePath, type Lang } from '@/lib/i18n'


// ─── Locale & time-format resolution ────────────────────────
// Maps the site's selected language to a default locale + 24h preference.
// The browser's region (e.g. "de-AT", "en-GB", "pt-BR") can override if it
// belongs to the same language family, giving regionally correct formatting.

const LANG_DEFAULTS: Record<string, { locale: string; is24h: boolean }> = {
  de: { locale: 'de-DE', is24h: true },    // Germany, Austria, Switzerland — always 24h
  en: { locale: 'en-US', is24h: false },    // US English — 12h default
  fr: { locale: 'fr-FR', is24h: true },     // France — 24h
  es: { locale: 'es-ES', is24h: true },     // Spain — 24h
  pt: { locale: 'pt-BR', is24h: true },     // Brazil — the site's Portuguese is pt-BR; 24h
  it: { locale: 'it-IT', is24h: true },     // Italy — 24h
}

// Regions where 12-hour time is the norm (even if the language default is 24h)
const REGIONS_12H = new Set([
  'US', 'PH', 'MY', 'AU', 'CA', 'NZ', 'IN', 'EG', 'SA', 'CO', 'PK', 'BD',
])

function resolveLocaleAndFormat(siteLang: Lang): { locale: string; is24h: boolean } {
  const defaults = LANG_DEFAULTS[siteLang] || LANG_DEFAULTS.en

  if (typeof navigator === 'undefined') return defaults

  // Try to find a browser locale that matches the site language
  const browserLocales = navigator.languages || [navigator.language]
  let matchedLocale: string | null = null
  let region: string | null = null

  for (const bl of browserLocales) {
    const parts = bl.split('-')
    const lang = parts[0].toLowerCase()
    if (lang === siteLang) {
      matchedLocale = bl
      region = parts[1]?.toUpperCase() || null
      break
    }
  }

  // If no browser locale matches the site language, use the language default
  const locale = matchedLocale || defaults.locale

  // Determine 24h: start with the language default, then check if the user's
  // region is known to use 12h (e.g. en-AU → 12h, en-GB → 24h)
  let is24h = defaults.is24h

  if (region) {
    if (REGIONS_12H.has(region)) {
      is24h = false
    } else if (!defaults.is24h) {
      // If language default is 12h (English), check if region uses 24h
      // e.g. en-GB, en-DE → 24h
      if (!REGIONS_12H.has(region) && region !== 'US') {
        // Use Intl to detect for this specific locale
        try {
          const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
          is24h = !resolved.hour12
        } catch {
          // keep default
        }
      }
    }
  }

  return { locale, is24h }
}

function useLocaleFormat(lang: Lang) {
  const [result, setResult] = useState<{ locale: string; is24h: boolean }>(() =>
    LANG_DEFAULTS[lang] || LANG_DEFAULTS.en
  )

  useEffect(() => {
    setResult(resolveLocaleAndFormat(lang))
  }, [lang])

  return result
}

// ─── Helpers ────────────────────────────────────────────────

function localDate(iso: string) {
  return new Date(iso)
}

function formatTime(iso: string, is24h: boolean, locale: string): string {
  const d = localDate(iso)
  try {
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

function formatWeekday(iso: string, locale: string): string {
  return localDate(iso).toLocaleDateString(locale, { weekday: 'short' })
}

function getWeekdayNames(locale: string): string[] {
  // Generate localized weekday abbreviations starting from Sunday
  const names: string[] = []
  for (let i = 0; i < 7; i++) {
    // Jan 4 2026 is a Sunday
    const d = new Date(2026, 0, 4 + i)
    names.push(d.toLocaleDateString(locale, { weekday: 'short' }))
  }
  return names
}

function getMonthKey(iso: string): string {
  const d = localDate(iso)
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
}

function getMonthLabel(key: string, locale: string): string {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month, 1)
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

// ─── Shared Components ──────────────────────────────────────

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-rs-live text-white text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
      LIVE
    </span>
  )
}

// ─── List View ──────────────────────────────────────────────

function ListView({ lang, events, year, month, is24h, locale }: { lang: Lang; events: CalendarEvent[]; year: number; month: number; is24h: boolean; locale: string }) {
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = localDate(e.dateISO)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }, [events, year, month])

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
          <EventRow key={event.id} lang={lang} event={event} is24h={is24h} locale={locale} />
        ))}
      </div>
    </div>
  )
}

function EventRow({ lang, event, is24h, locale }: { lang: Lang; event: CalendarEvent; is24h: boolean; locale: string }) {
  const d = localDate(event.dateISO)
  const day = d.getDate()
  const weekday = formatWeekday(event.dateISO, locale)
  const monthStr = d.toLocaleDateString(locale, { month: 'short' })

  return (
    <a
      href={localePath(lang, '/live')}
      className="group grid grid-cols-[56px_1fr_auto] md:grid-cols-[64px_1fr_auto] gap-4 py-4 px-3 -mx-3
                 hover:bg-rs-dark/60 transition-colors border-b border-rs-border/30 cursor-pointer"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase text-rs-muted font-medium leading-none">{weekday}</span>
        <span className="text-xl font-display font-bold text-rs-white leading-tight">{day}</span>
        <span className="text-[10px] uppercase text-rs-muted leading-none">{monthStr}</span>
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 flex-wrap">
          {event.isLive && <LiveBadge />}
          <p className="text-rs-white font-medium text-sm truncate group-hover:text-rs-yellow transition-colors">
            {event.series}
          </p>
        </div>
        {event.description && (
          <p className="text-rs-muted text-xs mt-0.5 truncate">{event.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[11px] text-rs-yellow font-bold">{formatTime(event.dateISO, is24h, locale)}</span>
          <span className="text-[10px] text-rs-muted/50">–</span>
          <span className="text-[11px] text-rs-muted">{formatTime(event.endDateISO, is24h, locale)}</span>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-xs text-rs-yellow font-display font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          Watch →
        </span>
      </div>
    </a>
  )
}

// ─── Calendar Grid View ─────────────────────────────────────

function CalendarGridView({
  lang,
  events,
  year,
  month,
  is24h,
  locale,
}: {
  lang: Lang
  events: CalendarEvent[]
  year: number
  month: number
  is24h: boolean
  locale: string
}) {
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    for (const e of events) {
      const d = localDate(e.dateISO)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(e)
      }
    }
    // Sort each day's events by tier (1 = highest priority, shown first)
    map.forEach((dayEvents) => {
      dayEvents.sort((a, b) => a.tier - b.tier)
    })
    return map
  }, [events, year, month])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = today.getDate()

  const WEEKDAYS = useMemo(() => getWeekdayNames(locale), [locale])

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="min-w-[700px]">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="text-center text-xs text-rs-muted uppercase tracking-wider py-2 font-medium">
              {wd}
            </div>
          ))}
        </div>

        {/* Day grid — auto-rows ensures every row has equal height */}
        <div className="grid grid-cols-7 gap-1 auto-rows-fr">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[150px] md:min-h-[170px] lg:min-h-[190px] bg-rs-dark/20 rounded-rs" />
            }

            const dayEvents = eventsByDay.get(day) || []
            const isToday = isCurrentMonth && day === todayDate

            return (
              <DayCell
                key={day}
                lang={lang}
                day={day}
                events={dayEvents}
                isToday={isToday}
                is24h={is24h}
                locale={locale}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Day Cell with Carousel ─────────────────────────────────

function DayCell({
  lang,
  day,
  events,
  isToday,
  is24h,
  locale,
}: {
  lang: Lang
  day: number
  events: CalendarEvent[]
  isToday: boolean
  is24h: boolean
  locale: string
}) {
  const t = getT(lang)
  const [activeIndex, setActiveIndex] = useState(0)
  const hasEvents = events.length > 0
  const hasMultiple = events.length > 1

  // Reset index when events change
  useEffect(() => {
    setActiveIndex(0)
  }, [events.length])

  return (
    <div
      className={`min-h-[150px] md:min-h-[170px] lg:min-h-[190px] p-2 md:p-3 rounded-rs flex flex-col transition-colors
        ${isToday
          ? 'bg-rs-yellow/10 border border-rs-yellow/30'
          : 'bg-rs-dark/30 border border-transparent'
        }
        ${hasEvents ? 'hover:border-rs-border/60' : ''}`}
    >
      {/* Day number row — fixed h-6 so today-badge and plain number take same space */}
      <div className="flex items-center justify-between mb-1.5 h-6">
        <div className="flex items-center gap-1.5">
          {isToday ? (
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-rs-yellow text-rs-black text-xs font-bold">
              {day}
            </span>
          ) : (
            <span className="text-sm font-medium text-rs-muted leading-6">{day}</span>
          )}
          {hasMultiple && (
            <span className="text-[10px] text-rs-yellow bg-rs-yellow/10 px-1.5 py-0.5 rounded font-bold">
              {events.length}
            </span>
          )}
        </div>
      </div>

      {/* Event card area — always uses flex-1 so card + nav fill the same space */}
      {hasEvents && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Card with animation */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <EventCard lang={lang} event={events[activeIndex]} is24h={is24h} locale={locale} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel navigation — ALWAYS rendered with same height to keep cards aligned.
              For single-event days, the row is invisible but still occupies space. */}
          <div className={`flex items-center justify-between mt-1.5 pt-1.5 h-7
            ${hasMultiple ? 'border-t border-rs-border/20' : ''}`}
          >
            {hasMultiple ? (
              <>
                {/* Prev arrow (desktop only) */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIndex(i => Math.max(0, i - 1)) }}
                  disabled={activeIndex === 0}
                  className="hidden md:flex w-5 h-5 items-center justify-center text-rs-muted hover:text-rs-yellow disabled:opacity-20 transition-colors"
                  aria-label={t('calendar.prevEvent')}
                >
                  ‹
                </button>

                {/* Dots */}
                <div className="flex items-center gap-1.5 mx-auto md:mx-0">
                  {events.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIndex(idx) }}
                      className={`rounded-full transition-colors p-0.5
                        ${idx === activeIndex
                          ? 'bg-rs-yellow w-2 h-2'
                          : 'bg-rs-muted/30 hover:bg-rs-muted/60 w-1.5 h-1.5'}`}
                      aria-label={`Event ${idx + 1} of ${events.length}`}
                    />
                  ))}
                </div>

                {/* Next arrow (desktop only) */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIndex(i => Math.min(events.length - 1, i + 1)) }}
                  disabled={activeIndex === events.length - 1}
                  className="hidden md:flex w-5 h-5 items-center justify-center text-rs-muted hover:text-rs-yellow disabled:opacity-20 transition-colors"
                  aria-label={t('calendar.nextEvent')}
                >
                  ›
                </button>
              </>
            ) : (
              /* Invisible spacer — same height as the dots row */
              <span aria-hidden="true" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Event Card (for calendar grid) ─────────────────────────

function EventCard({ lang, event, is24h, locale }: { lang: Lang; event: CalendarEvent; is24h: boolean; locale: string }) {
  return (
    <a
      href={localePath(lang, '/live')}
      className="group flex flex-col justify-center h-full rounded-rs bg-rs-dark/60 border border-rs-border/40
                 p-2 md:p-2.5 hover:border-rs-yellow/40 hover:bg-rs-dark transition-colors cursor-pointer"
    >
      {/* Live badge */}
      {event.isLive && (
        <div className="mb-1">
          <LiveBadge />
        </div>
      )}

      {/* Series title — prominent */}
      <p className="font-display font-bold text-[10px] md:text-[11px] lg:text-[12px] leading-tight text-white
                    group-hover:text-rs-yellow transition-colors line-clamp-2 lg:line-clamp-3 uppercase">
        {event.series}
      </p>

      {/* Description */}
      {event.description && (
        <p className="text-[10px] md:text-[11px] text-rs-muted mt-0.5 line-clamp-1">
          {event.description}
        </p>
      )}

      {/* Start time */}
      <div className="mt-auto pt-1">
        <span className="text-[10px] md:text-[11px] text-rs-yellow font-bold whitespace-nowrap">
          {formatTime(event.dateISO, is24h, locale)}
        </span>
      </div>
    </a>
  )
}

// ─── Empty state ────────────────────────────────────────────

function EmptyState({ lang }: { lang: Lang }) {
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

// ─── Main Calendar Component ────────────────────────────────

type ViewMode = 'list' | 'calendar'

export function CalendarClient({ lang, events }: { lang: Lang; events: CalendarEvent[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const timezone = getUserTimezone()
  const { locale, is24h } = useLocaleFormat(lang)
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

  const calMonthLabel = new Date(calYear, calMonth, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  })

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

      {/* Controls bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center bg-rs-dark border border-rs-border rounded-rs overflow-hidden">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-xs font-display font-bold uppercase tracking-wider transition-colors
              ${viewMode === 'calendar' ? 'bg-rs-yellow text-rs-black' : 'text-rs-muted hover:text-white'}`}
          >
            {t('calendar.calendarView')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-xs font-display font-bold uppercase tracking-wider transition-colors
              ${viewMode === 'list' ? 'bg-rs-yellow text-rs-black' : 'text-rs-muted hover:text-white'}`}
          >
            {t('calendar.listView')}
          </button>
        </div>

        {/* Month nav — always visible for both views */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-rs border border-rs-border text-rs-muted hover:text-white hover:border-rs-yellow transition-colors"
          >
            ←
          </button>
          <span className="text-sm font-display font-bold text-white min-w-[140px] text-center">
            {calMonthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-rs border border-rs-border text-rs-muted hover:text-white hover:border-rs-yellow transition-colors"
          >
            →
          </button>
        </div>

        {/* Timezone indicator */}
        <div className="text-[11px] text-rs-muted">
          🕐 {timezone.replace(/_/g, ' ')}
        </div>
      </div>

      {/* View content */}
      {viewMode === 'list' ? (
        <ListView lang={lang} events={events} year={calYear} month={calMonth} is24h={is24h} locale={locale} />
      ) : (
        <CalendarGridView lang={lang} events={events} year={calYear} month={calMonth} is24h={is24h} locale={locale} />
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
