'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { useLocalFormat } from '@/lib/hooks/useLocalTime'
import { getT, localePath, type Lang } from '@/lib/i18n'

// ─── Types ──────────────────────────────────────────────────

interface SerializedEvent {
  series: string
  description: string
  dateISO: string
  tier: number
}

interface LiveOfflineProps {
  lang: Lang
  nextEvent: SerializedEvent | null
  upcomingEvents: SerializedEvent[]
  channelId: string
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

export function LiveOffline({ lang, nextEvent, upcomingEvents, channelId }: LiveOfflineProps) {
  const fmt = useLocalFormat(lang)
  const countdown = useCountdown(nextEvent?.dateISO || '')
  const t = getT(lang)

  const hasCountdown = nextEvent && (countdown.days > 0 || countdown.hours > 0 || countdown.mins > 0 || countdown.secs > 0)

  // Auto-refresh in the first 3 minutes after scheduled start to detect live stream
  useEffect(() => {
    if (!nextEvent?.dateISO) return

    const startTime = new Date(nextEvent.dateISO).getTime()
    const now = Date.now()
    const msSinceStart = now - startTime
    const THREE_MIN = 3 * 60 * 1000
    const POLL_INTERVAL = 30 * 1000 // 30 seconds

    // If we're within 3 minutes after the scheduled start, poll for live stream
    if (msSinceStart >= 0 && msSinceStart < THREE_MIN) {
      const interval = setInterval(() => {
        window.location.reload()
      }, POLL_INTERVAL)
      return () => clearInterval(interval)
    }

    // If the start time is in the near future (< 1 min), set a timer to start polling
    if (msSinceStart < 0 && msSinceStart > -60 * 1000) {
      const timeout = setTimeout(() => {
        window.location.reload()
      }, Math.abs(msSinceStart))
      return () => clearTimeout(timeout)
    }
  }, [nextEvent?.dateISO])

  return (
    <div className="pt-8 min-h-screen">
      <div className="container-rs py-8">
        <p className="section-label mb-3">{t('live.nextUp')}</p>
        <h1 className="display-title mb-8">{t('live.upcomingBroadcast')}</h1>

        {/* Offline state hero */}
        <div
          className="rounded-lg border border-rs-border p-8 md:p-12 lg:p-16 text-center mb-16"
          style={{
            background: 'linear-gradient(180deg, #111 0%, #0A0A0A 100%)',
          }}
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
                    { value: countdown.days, label: t('live.days') },
                    { value: String(countdown.hours).padStart(2, '0'), label: t('live.hrs') },
                    { value: String(countdown.mins).padStart(2, '0'), label: t('live.min') },
                    { value: String(countdown.secs).padStart(2, '0'), label: t('live.sec') },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="bg-rs-dark border border-rs-border rounded-rs px-3 sm:px-5 py-3 min-w-[60px] sm:min-w-[80px] text-center"
                    >
                      <p className="font-display font-black text-rs-yellow text-2xl sm:text-4xl leading-none">
                        {unit.value}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-rs-muted mt-1">
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  {t('live.subscribe')}
                </a>
                <Link href={localePath(lang, '/calendar')} className="btn-outline">
                  {t('live.viewCalendar')}
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* No upcoming events */}
              <h2 className="section-title mb-4">{t('live.noUpcoming')}</h2>
              <p className="text-rs-muted text-sm max-w-md mx-auto mb-8">
                {t('live.noUpcomingDesc')}
              </p>
              <a
                href={`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {t('live.subscribe')}
              </a>
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
              {upcomingEvents.map((event, i) => (
                <UpcomingEventRow key={event.dateISO + event.series} event={event} fmt={fmt} />
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

// ─── Sub-components ─────────────────────────────────────────

function UpcomingEventRow({ event, fmt }: { event: SerializedEvent; fmt: Fmt }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-rs border border-rs-border bg-rs-dark hover:border-rs-yellow/40 transition-colors">
      {/* Date */}
      <div className="shrink-0 text-center min-w-[60px]">
        <p className="text-[11px] uppercase text-rs-muted">
          {new Date(event.dateISO).toLocaleDateString(fmt.locale, { weekday: 'short', timeZone: fmt.timeZone })}
        </p>
        <p className="text-xl font-display font-bold text-white">
          {new Date(event.dateISO).toLocaleDateString(fmt.locale, { day: 'numeric', timeZone: fmt.timeZone })}
        </p>
        <p className="text-[11px] uppercase text-rs-muted">
          {new Date(event.dateISO).toLocaleDateString(fmt.locale, { month: 'short', timeZone: fmt.timeZone })}
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-rs-border shrink-0" />

      {/* Event info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">
          {event.series}
        </p>
        {event.description && (
          <p className="text-rs-muted text-xs truncate">{event.description}</p>
        )}
      </div>

      {/* Time */}
      <p className="text-rs-yellow text-sm font-display font-bold shrink-0">
        {formatLocalTime(event.dateISO, fmt)}
      </p>
    </div>
  )
}
