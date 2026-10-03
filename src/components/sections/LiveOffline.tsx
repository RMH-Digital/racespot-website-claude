'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { useLocalFormat } from '@/lib/hooks/useLocalTime'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { FollowUs } from '@/components/ui/FollowUs'
import { AddToCalendar } from '@/components/sections/calendar/AddToCalendar'
import { UpcomingRow } from '@/components/sections/calendar/UpcomingRow'
import type { CalendarEvent } from '@/lib/sheets'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'

// ─── Types ──────────────────────────────────────────────────

interface LiveOfflineProps {
  lang: Lang
  nextEvent: CalendarEvent | null
  upcomingEvents: CalendarEvent[]
}

// ─── Locale helpers ─────────────────────────────────────────
// Locale comes from the route and the timezone is pinned to UTC until mount,
// so server and first client render agree. See lib/hooks/useLocalTime.ts.

interface Fmt { locale: string; timeZone: string | undefined; is24h: boolean }

function formatLocalTime(iso: string, { locale, timeZone, is24h }: Fmt): string {
  const d = new Date(iso)
  try {
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24h,
      timeZone,
    })
  } catch {
    return ''
  }
}

function formatLocalDate(iso: string, { locale, timeZone }: Fmt): string {
  const d = new Date(iso)
  try {
    const weekday = d.toLocaleDateString(locale, { weekday: 'short', timeZone })
    const day = d.toLocaleDateString(locale, { day: 'numeric', timeZone })
    const month = d.toLocaleDateString(locale, { month: 'short', timeZone })
    return `${weekday} ${day} ${month}`
  } catch {
    return ''
  }
}

// ─── Component ──────────────────────────────────────────────

export function LiveOffline({ lang, nextEvent, upcomingEvents }: LiveOfflineProps) {
  const fmt = useLocalFormat(lang)
  const countdown = useCountdown(nextEvent?.dateISO || '')
  const t = getT(lang)

  // Before the first tick the boxes are already there, with dashes: they
  // used to appear only after hydration and pushed the buttons below them
  // down by 120px (layout shift 0.07, measured 2026-10-02).
  const hasCountdown = nextEvent && (!countdown.ready || countdown.days > 0 || countdown.hours > 0 || countdown.mins > 0 || countdown.secs > 0)
  const unit = (v: number, pad: boolean) => (countdown.ready ? (pad ? String(v).padStart(2, '0') : String(v)) : '–')

  // The header's poll (LiveStatusProvider, once a minute) is the first to
  // know when the stream is up; one reload then swaps this page for the
  // player. Until 2026-09-22 this component reloaded the whole page every
  // thirty seconds for the first three minutes after the scheduled start,
  // and only then — a stream that began early or late was never noticed.
  const { isLive, loaded, polledAt } = useLiveStatus()
  const reloaded = useRef(false)
  // Only a poll made after this page appeared counts — see LiveEmbed.
  const [mountedAt] = useState(() => Date.now())
  useEffect(() => {
    if (!loaded || !isLive || reloaded.current || polledAt < mountedAt) return
    reloaded.current = true
    window.location.reload()
  }, [isLive, loaded, polledAt, mountedAt])

  return (
    <div className="pt-8 min-h-screen">
      <div className="container-rs py-8">
        <p className="section-label mb-3">{t('live.nextUp')}</p>
        <h1 className="display-title mb-8">{t('live.upcomingBroadcast')}</h1>

        {/* Offline state hero */}
        <div
          className="rounded-rs border border-rs-border bg-linear-to-b from-rs-dark to-rs-black p-8 md:p-12 lg:p-16 text-center mb-16"
        >
          {/* Offline indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-rs-muted" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-rs-muted">
              {t('live.offline')}
            </span>
          </div>

          {nextEvent ? (
            <>
              {/* Next broadcast info */}
              <p className="section-label mb-3">{t('live.nextBroadcast')}</p>
              <h2
                className="font-display font-black text-rs-yellow uppercase leading-[0.95] mb-3"
                style={{ fontSize: 'clamp(24px, 4vw, 48px)' }}
              >
                {nextEvent.series}
              </h2>
              {nextEvent.description && (
                <p className="text-white/60 text-sm mb-2 max-w-lg mx-auto">
                  {nextEvent.description}
                </p>
              )}
              <p className="text-rs-muted text-sm mb-8">
                {formatLocalDate(nextEvent.dateISO, fmt)} · {formatLocalTime(nextEvent.dateISO, fmt)}
              </p>

              {/* Countdown */}
              {hasCountdown && (
                <div className="flex justify-center gap-3 sm:gap-4 mb-10">
                  {[
                    { value: unit(countdown.days, false), label: t('live.days') },
                    { value: unit(countdown.hours, true), label: t('live.hrs') },
                    { value: unit(countdown.mins, true), label: t('live.min') },
                    { value: unit(countdown.secs, true), label: t('live.sec') },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="bg-rs-dark border border-rs-border rounded-rs px-3 sm:px-5 py-3 min-w-[60px] sm:min-w-[80px] text-center"
                    >
                      <p className="font-display font-black text-rs-yellow text-2xl sm:text-4xl leading-none tabular-nums">
                        {unit.value}
                      </p>
                      <p className="text-[11px] uppercase tracking-widest text-rs-muted mt-1">
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTAs. Ours on the left — the reminder and the calendar —
                  YouTube's on the right; one column of equal buttons on a phone. */}
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 text-left">
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {/* The calendar's save menu: this broadcast, the whole
                      series, and the YouTube bell once the stream is announced. */}
                  <AddToCalendar lang={lang} event={nextEvent} t={t} labeled />
                  <Link href={localePath(lang, '/calendar')} className="btn-outline whitespace-nowrap">
                    {t('live.viewCalendar')}
                  </Link>
                </div>
                <FollowUs lang={lang} size="md" stretch className="sm:justify-end" />
              </div>
            </>
          ) : (
            <>
              {/* No upcoming events */}
              <h2 className="section-title mb-4">{t('live.noUpcoming')}</h2>
              <p className="text-rs-muted text-sm max-w-md mx-auto mb-8">
                {t('live.noUpcomingDesc')}
              </p>
              <FollowUs lang={lang} size="md" stretch className="mx-auto max-w-md sm:justify-center" />
            </>
          )}
        </div>

        {/* Upcoming schedule */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="section-header">
              <div>
                <p className="section-label mb-2">{t('live.comingSoon')}</p>
                <h2 className="section-title">{t('live.upcomingSchedule')}</h2>
              </div>
              <Link href={localePath(lang, '/calendar')} className="btn-ghost hidden sm:flex">
                {t('live.fullCalendar')}
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <UpcomingRow key={event.id} lang={lang} event={event} />
              ))}
            </div>

            <div className="mt-6 sm:hidden">
              <Link href={localePath(lang, '/calendar')} className="btn-ghost">
                {t('live.viewFullCalendar')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
