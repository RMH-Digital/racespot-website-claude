'use client'

import { getT, localePath, type Lang } from '@/lib/i18n'
import { useVideoPlayer } from '@/components/video/VideoPlayerProvider'
import { YOUTUBE_STREAMS_URL, YouTubeIcon } from '@/lib/socials'
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
      <p className="mt-2 text-[11px] uppercase tracking-wider font-display font-bold text-rs-muted">
        {event.isPast ? t(event.videoId ? 'calendar.tipReplay' : 'calendar.tipNoReplay') : t('calendar.eventTip')}
      </p>
    </>
  )
}

/**
 * The stretched click target behind a broadcast. Upcoming and live go to the
 * live page; a past broadcast with a recording opens it in the site's player;
 * a past one without goes to the channel's list of past streams on YouTube —
 * the one case where the reader does leave.
 */
export function EventLink({ lang, event, className }: { lang: Lang; event: CalendarEvent; className: string }) {
  const { play } = useVideoPlayer()
  const label = <span className="sr-only">{event.series}</span>
  if (!event.isPast) {
    return <a href={localePath(lang, '/live')} className={className} aria-label={event.series}>{label}</a>
  }
  if (event.videoId) {
    const id = event.videoId
    return (
      <button type="button" onClick={() => play({ kind: 'video', id, title: event.series })} className={className} aria-label={event.series}>
        {label}
      </button>
    )
  }
  return (
    <a href={YOUTUBE_STREAMS_URL} target="_blank" rel="noopener noreferrer" className={className} aria-label={event.series}>
      {label}
    </a>
  )
}

export function ReplayBadge({ lang }: { lang: Lang }) {
  const t = getT(lang)
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
      <span aria-hidden="true">▶</span>
      {t('calendar.replay')}
    </span>
  )
}

/** The recording on YouTube itself, as an icon beside the time — the click on the card plays it here. */
export function ReplayOnYouTube({ lang, videoId, compact = false }: { lang: Lang; videoId: string; compact?: boolean }) {
  const t = getT(lang)
  return (
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={t('calendar.openReplayOnYouTube')}
      aria-label={t('calendar.openReplayOnYouTube')}
      className={`relative z-10 flex shrink-0 items-center justify-center rounded-rs transition-colors
        ${compact ? 'h-6 w-6 text-rs-muted hover:text-rs-yellow' : 'h-11 w-11 border border-rs-border text-rs-muted hover:border-rs-yellow hover:text-rs-yellow'}`}
    >
      <YouTubeIcon size={compact ? 13 : 16} />
    </a>
  )
}
