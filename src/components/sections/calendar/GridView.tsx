'use client'

import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CalendarEvent } from '@/lib/sheets'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { AddToCalendar } from './AddToCalendar'
import { LiveBadge } from './shared'
import { localDate, formatTime, getWeekdayNames, getDaysInMonth, getFirstDayOfWeek, zonedParts } from './time'

export function CalendarGridView({
  lang,
  events,
  year,
  month,
  is24h,
  locale,
  timeZone,
}: {
  lang: Lang
  events: CalendarEvent[]
  year: number
  month: number
  is24h: boolean
  locale: string
  timeZone?: string
}) {
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    for (const e of events) {
      // Which day a race belongs to is itself timezone-dependent — a 00:30 UTC
      // start falls on the previous day in New York.
      const p = zonedParts(localDate(e.dateISO), timeZone)
      if (p.year === year && p.month === month) {
        if (!map.has(p.day)) map.set(p.day, [])
        map.get(p.day)!.push(e)
      }
    }
    // Sort each day's events by tier (1 = highest priority, shown first)
    map.forEach((dayEvents) => {
      dayEvents.sort((a, b) => a.tier - b.tier)
    })
    return map
  }, [events, year, month, timeZone])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const today = zonedParts(new Date(), timeZone)
  const isCurrentMonth = today.year === year && today.month === month
  const todayDate = today.day

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
                timeZone={timeZone}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DayCell({
  lang,
  day,
  events,
  isToday,
  is24h,
  locale,
  timeZone,
}: {
  lang: Lang
  day: number
  events: CalendarEvent[]
  isToday: boolean
  is24h: boolean
  locale: string
  timeZone?: string
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
            <span className="text-[11px] text-rs-yellow bg-rs-yellow/10 px-1.5 py-0.5 rounded-sm font-bold">
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
                <EventCard lang={lang} event={events[activeIndex]} is24h={is24h} locale={locale} timeZone={timeZone} />
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
                <div className="flex flex-wrap items-center justify-center gap-0.5 mx-auto md:mx-0">
                  {events.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIndex(idx) }}
                      className="group/dot flex h-6 w-6 items-center justify-center rounded-full"
                      aria-label={`Event ${idx + 1} of ${events.length}`}
                      aria-current={idx === activeIndex || undefined}
                    >
                      <span
                        className={`rounded-full transition-colors
                          ${idx === activeIndex
                            ? 'bg-rs-yellow w-2 h-2'
                            : 'bg-rs-muted/70 group-hover/dot:bg-rs-muted w-1.5 h-1.5'}`}
                      />
                    </button>
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

function EventCard({ lang, event, is24h, locale, timeZone }: { lang: Lang; event: CalendarEvent; is24h: boolean; locale: string; timeZone?: string }) {
  const t = getT(lang)

  return (
    <div
      className="group relative flex flex-col justify-center h-full rounded-rs bg-rs-dark/60 border border-rs-border/40
                 p-2 md:p-2.5 hover:border-rs-yellow/40 hover:bg-rs-dark transition-colors"
    >
      <a href={localePath(lang, '/live')} className="absolute inset-0 rounded-rs" aria-label={event.series}>
        <span className="sr-only">{event.series}</span>
      </a>
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

      {/* Start time, and the calendar download beside it */}
      <div className="mt-auto pt-1 flex items-center justify-between gap-1">
        <span className="text-[10px] md:text-[11px] text-rs-yellow font-bold whitespace-nowrap">
          {formatTime(event.dateISO, is24h, locale, timeZone)}
        </span>
        <AddToCalendar lang={lang} event={event} t={t} compact />
      </div>
    </div>
  )
}
