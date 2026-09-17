'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CalendarEvent } from '@/lib/sheets'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { AddToCalendar } from './AddToCalendar'
import { EventRow } from './ListView'
import { LiveBadge, EmptyState, EventTipContent, EventLink, ReplayBadge, ReplayOnYouTube, UpNextBadge } from './shared'
import { Tip } from '@/components/ui/Tip'
import { useEventStatus } from './status'
import { localDate, formatTime, getWeekdayNames, getDaysInMonth, getFirstDayOfWeek, zonedParts } from './time'

export function CalendarGridView({
  lang,
  events,
  year,
  month,
  is24h,
  locale,
  timeZone,
  nextId,
  onPrevMonth,
  onNextMonth,
}: {
  lang: Lang
  events: CalendarEvent[]
  year: number
  month: number
  is24h: boolean
  locale: string
  timeZone?: string
  /** id of the very next broadcast, for its badge */
  nextId?: string
  /** The phone view turns the month on a swipe — through the same handlers as the arrows */
  onPrevMonth?: () => void
  onNextMonth?: () => void
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
    <>
      {/* Phones: the month as a compact grid of dots, the chosen day spelled
          out underneath — see MonthCompact. */}
      <MonthCompact
        lang={lang}
        cells={cells}
        eventsByDay={eventsByDay}
        year={year}
        month={month}
        todayDate={isCurrentMonth ? todayDate : null}
        weekdays={WEEKDAYS}
        is24h={is24h}
        locale={locale}
        timeZone={timeZone}
        nextId={nextId}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />

      {/* Tablets and up: one card per day with the broadcast on it. */}
      <div className="hidden md:block overflow-x-auto">
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
                nextId={nextId}
              />
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}

/**
 * The month on a phone.
 *
 * Seven day cards of ~95 px do not fit in 360 px, and the earlier answer — the
 * desktop grid behind a horizontal scroll — showed four days of seven at
 * ten-pixel type. This is the shape every phone calendar settles on instead:
 * a compact seven-column month where each day is a 44 px tap target with a
 * dot per broadcast (yellow ahead, red live, grey past), and under it the
 * chosen day written out in full-size rows — the same rows as the list view,
 * with the same buttons. Tapping a day swaps the rows; swiping the grid
 * changes the month, as the arrows above do.
 *
 * The grid opens on the day that matters: the one with something live, else
 * the one with the next broadcast, else today, else the first day with any
 * broadcast. A tap overrides that until the month changes.
 */
const MAX_DOTS = 3
const SWIPE_PX = 48

function MonthCompact({
  lang,
  cells,
  eventsByDay,
  year,
  month,
  todayDate,
  weekdays,
  is24h,
  locale,
  timeZone,
  nextId,
  onPrevMonth,
  onNextMonth,
}: {
  lang: Lang
  cells: (number | null)[]
  eventsByDay: Map<number, CalendarEvent[]>
  year: number
  month: number
  /** Today's day of month when this is the current month, else null */
  todayDate: number | null
  weekdays: string[]
  is24h: boolean
  locale: string
  timeZone?: string
  nextId?: string
  onPrevMonth?: () => void
  onNextMonth?: () => void
}) {
  const t = getT(lang)
  const statusOf = useEventStatus()
  const monthKey = `${year}-${month}`

  const defaultDay = useMemo(() => {
    const days = [...eventsByDay.keys()].sort((a, b) => a - b)
    const liveDay = days.find((d) => eventsByDay.get(d)!.some((e) => statusOf(e).live))
    if (liveDay) return liveDay
    const nextDay = days.find((d) => eventsByDay.get(d)!.some((e) => e.id === nextId))
    if (nextDay) return nextDay
    if (todayDate) return todayDate
    return days[0] ?? 1
  }, [eventsByDay, statusOf, nextId, todayDate])

  // The tap is remembered together with the month it was made in, so the next
  // month opens on its own default rather than on "the 17th" again.
  const [chosen, setChosen] = useState<{ key: string; day: number } | null>(null)
  const selectedDay = chosen?.key === monthKey ? chosen.day : defaultDay
  const selectedEvents = eventsByDay.get(selectedDay) ?? []
  // Built from parts, formatted without a zone: identical on server and client.
  const selectedLabel = new Date(year, month, selectedDay).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })

  // A horizontal swipe on the grid turns the month — the arrows still work,
  // but a thumb expects this. Vertical movement is left to the page.
  const touch = useRef<{ x: number; y: number } | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) onNextMonth?.()
    else onPrevMonth?.()
  }

  return (
    <div className="md:hidden">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((wd) => (
          <div key={wd} className="text-center text-[11px] text-rs-muted uppercase tracking-wider py-1.5 font-medium">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} aria-hidden="true" />
          const dayEvents = eventsByDay.get(day) ?? []
          const selected = day === selectedDay
          const isToday = day === todayDate
          const n = dayEvents.length
          const label = `${new Date(year, month, day).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}${n ? `, ${n} ${t(n === 1 ? 'calendar.eventOne' : 'calendar.eventMany')}` : ''}`
          return (
            <button
              key={day}
              type="button"
              onClick={() => setChosen({ key: monthKey, day })}
              aria-pressed={selected}
              aria-label={label}
              className={`flex min-h-[52px] flex-col items-center justify-start gap-1 rounded-rs border pt-1.5 pb-1 transition-colors
                ${selected ? 'border-rs-yellow/50 bg-rs-yellow/10' : 'border-transparent bg-rs-dark/30'}
                ${n ? '' : 'text-rs-muted/60'}`}
            >
              {isToday ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rs-yellow text-xs font-bold text-rs-black">{day}</span>
              ) : (
                <span className={`flex h-6 items-center text-sm font-medium ${n ? 'text-white' : ''}`}>{day}</span>
              )}
              {/* One dot per broadcast — the day's rows below say what they are */}
              <span className="flex h-1.5 items-center gap-[3px]" aria-hidden="true">
                {dayEvents.slice(0, MAX_DOTS).map((e) => {
                  const st = statusOf(e)
                  return (
                    <span
                      key={e.id}
                      className={`h-1.5 w-1.5 rounded-full ${st.live ? 'bg-rs-live' : st.past ? 'bg-rs-muted/60' : 'bg-rs-yellow'}`}
                    />
                  )
                })}
              </span>
            </button>
          )
        })}
      </div>

      {/* The chosen day, in the list view's rows */}
      <div className="mt-5">
        <h3 className="mb-1 border-b border-rs-border pb-2 text-[11px] font-medium uppercase tracking-wider text-rs-muted" aria-live="polite">
          {selectedLabel}
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-rs-muted">{t('calendar.noEventsDay')}</p>
        ) : (
          selectedEvents.map((event) => (
            <EventRow
              key={event.id}
              lang={lang}
              event={event}
              is24h={is24h}
              locale={locale}
              timeZone={timeZone}
              isNext={event.id === nextId}
              showDate={false}
            />
          ))
        )}
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
  nextId,
}: {
  lang: Lang
  day: number
  events: CalendarEvent[]
  isToday: boolean
  is24h: boolean
  locale: string
  timeZone?: string
  nextId?: string
}) {
  const t = getT(lang)
  const statusOf = useEventStatus()
  // The card a day opens on: what is live, else the next broadcast still to
  // come, else the first. So a day with three streams shows the one that
  // matters now, not the one that sorts first.
  const defaultIndex = (list: CalendarEvent[]) => {
    const live = list.findIndex((e) => statusOf(e).live)
    if (live >= 0) return live
    const upcoming = list.findIndex((e) => !statusOf(e).past)
    return upcoming >= 0 ? upcoming : 0
  }
  const [activeIndex, setActiveIndex] = useState(() => defaultIndex(events))
  const hasEvents = events.length > 0
  const hasMultiple = events.length > 1

  // Re-pick when the day's events change (month navigation reuses cells) or
  // the live state does — a stream ending hands the cell to the next one.
  useEffect(() => {
    setActiveIndex(defaultIndex(events))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, statusOf])

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
                <EventCard lang={lang} event={events[activeIndex]} is24h={is24h} locale={locale} timeZone={timeZone} isNext={events[activeIndex].id === nextId} />
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
                  className="hidden md:flex w-6 h-6 items-center justify-center text-rs-muted hover:text-rs-yellow disabled:opacity-20 transition-colors"
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
                  className="hidden md:flex w-6 h-6 items-center justify-center text-rs-muted hover:text-rs-yellow disabled:opacity-20 transition-colors"
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

function EventCard({ lang, event, is24h, locale, timeZone, isNext = false }: { lang: Lang; event: CalendarEvent; is24h: boolean; locale: string; timeZone?: string; isNext?: boolean }) {
  const t = getT(lang)
  const status = useEventStatus()(event)
  const past = status.past
  const menuTrigger = useRef<HTMLButtonElement | null>(null)

  return (
    <Tip className="h-full" content={<EventTipContent lang={lang} event={event} is24h={is24h} locale={locale} timeZone={timeZone} />}>
    <div
      className={`group relative flex flex-col justify-center h-full rounded-rs bg-rs-dark/60 border border-rs-border/40
                 p-2 md:p-2.5 hover:border-rs-yellow/40 hover:bg-rs-dark transition-colors
                 ${past ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      <EventLink lang={lang} event={event} className="absolute inset-0 rounded-rs" onOpenMenu={() => menuTrigger.current?.click()} />
      {/* Live badge, "up next" on the very next one, or the replay mark once the recording is up */}
      {status.live && (
        <div className="mb-1">
          <LiveBadge />
        </div>
      )}
      {isNext && !status.live && (
        <div className="mb-1">
          <UpNextBadge lang={lang} />
        </div>
      )}
      {past && event.videoId && (
        <div className="mb-1">
          <ReplayBadge lang={lang} />
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

      {/* Start time, and beside it the calendar menu — or, for a past
          broadcast, the recording on YouTube */}
      <div className="mt-auto pt-1 flex items-center justify-between gap-1">
        <span className={`text-[10px] md:text-[11px] font-bold whitespace-nowrap ${past ? 'text-rs-muted' : 'text-rs-yellow'}`}>
          {formatTime(event.dateISO, is24h, locale, timeZone)}
        </span>
        {past
          ? <ReplayOnYouTube lang={lang} videoId={event.videoId} compact />
          : <AddToCalendar lang={lang} event={event} t={t} compact triggerRef={menuTrigger} />}
      </div>
    </div>
    </Tip>
  )
}
