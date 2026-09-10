'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { YouTubeLiveStream } from '@/lib/youtube-utils'
import { formatViewCount } from '@/lib/youtube-utils'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'

interface SerializedEvent {
  series: string
  description: string
  dateISO: string
  tier: number
}

interface LiveEmbedProps {
  lang: Lang
  liveStreams: YouTubeLiveStream[]
  upcomingEvents?: SerializedEvent[]
}

export function LiveEmbed({ lang, liveStreams: initialStreams, upcomingEvents = [] }: LiveEmbedProps) {
  const t = getT(lang)
  const [liveStreams, setLiveStreams] = useState(initialStreams)
  const [activeId, setActiveId] = useState(initialStreams[0]?.id || '')

  // Stream updates come from LiveStatusProvider, which already polls
  // /api/live-streams every 60 s for the header and ticker — no second poll here.
  const { liveStreams: polled, loaded } = useLiveStatus()

  useEffect(() => {
    if (!loaded) return

    if (polled.length === 0) {
      // All streams ended — full page reload to show offline state
      window.location.reload()
      return
    }

    setLiveStreams(polled)

    // If active stream is no longer live, switch to the first available
    setActiveId(prev => (polled.some(s => s.id === prev) ? prev : polled[0].id))
  }, [polled, loaded])

  // Find the active stream
  const activeStream = liveStreams.find(s => s.id === activeId) || liveStreams[0]
  if (!activeStream) return null

  const embedUrl = `https://www.youtube.com/embed/${activeStream.id}?autoplay=1&modestbranding=1&rel=0`

  return (
    <div className="pt-8 min-h-screen">
      <div className="container-rs py-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="badge-live">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
            {t('live.onAir')}
          </span>
          {liveStreams.length > 1 && (
            <span className="text-rs-yellow text-sm font-display font-bold">
              {liveStreams.length} {t('live.multipleStreams')}
            </span>
          )}
          {liveStreams.length === 1 && parseInt(activeStream.concurrentViewers) > 0 && (
            <span className="text-rs-muted text-sm">
              {formatViewCount(activeStream.concurrentViewers)} {t('live.watching')}
            </span>
          )}
        </div>
        <h1 className="display-title mb-8">{t('live.liveNow')}</h1>

        {/* Stream tabs — shown directly above video for 2+ streams */}
        {liveStreams.length > 1 && (
          <div className="flex gap-0 border-b border-rs-border mb-0 overflow-x-auto scrollbar-hide">
            {liveStreams.map((stream) => {
              const isActive = stream.id === activeStream.id
              return (
                <button
                  key={stream.id}
                  onClick={() => setActiveId(stream.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-xs font-display font-bold
                    transition-colors min-w-0 flex-1
                    ${isActive
                      ? 'text-white'
                      : 'text-rs-muted hover:text-white/80'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-rs-live animate-pulse-live' : 'bg-rs-muted/50'}`} />
                  <span className="truncate">{stream.title}</span>
                  {parseInt(stream.concurrentViewers) > 0 && (
                    <span className="text-[11px] text-rs-muted font-normal shrink-0">
                      {formatViewCount(stream.concurrentViewers)}
                    </span>
                  )}
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-rs-yellow" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Main embed */}
        <div className={`relative aspect-video bg-rs-dark border border-rs-border overflow-hidden mb-6
          ${liveStreams.length > 1 ? 'rounded-b-rs border-t-0' : 'rounded-rs'}`}>
          <iframe
            key={activeStream.id}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Stream info */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            {activeStream.title}
          </h2>
          {parseInt(activeStream.concurrentViewers) > 0 && (
            <p className="text-rs-muted text-sm mb-1">
              {formatViewCount(activeStream.concurrentViewers)} {t('live.watching')}
            </p>
          )}
          {activeStream.description && (
            <p className="text-rs-muted text-sm max-w-2xl line-clamp-3">
              {activeStream.description}
            </p>
          )}
        </div>

        {/* Chat embed */}
        <div className="border border-rs-border rounded-rs overflow-hidden">
          <div className="bg-rs-dark px-4 py-2.5 border-b border-rs-border">
            <p className="text-xs font-display font-bold uppercase tracking-wider text-rs-muted">
              {t('live.liveChat')}
            </p>
          </div>
          <div className="relative h-[400px] lg:h-[500px]">
            <iframe
              key={`chat-${activeStream.id}`}
              src={`https://www.youtube.com/live_chat?v=${activeStream.id}&embed_domain=racespot.tv`}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        {/* Upcoming schedule */}
        {upcomingEvents.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-6">
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
                <UpcomingEventRow key={i} event={event} />
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

function UpcomingEventRow({ event }: { event: SerializedEvent }) {
  const [is24h, setIs24h] = useState(true)

  useEffect(() => {
    try {
      const locale = navigator.language || 'en'
      if (locale.startsWith('de')) { setIs24h(true); return }
      const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
      setIs24h(!resolved.hour12)
    } catch {
      setIs24h(false)
    }
  }, [])

  const d = new Date(event.dateISO)
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'

  const time = (() => {
    try {
      return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: !is24h })
    } catch {
      const h = d.getHours()
      const m = String(d.getMinutes()).padStart(2, '0')
      return is24h ? `${String(h).padStart(2, '0')}:${m}` : `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`
    }
  })()

  return (
    <div className="flex items-center gap-4 p-4 rounded-rs border border-rs-border bg-rs-dark hover:border-rs-yellow/40 transition-colors">
      <div className="shrink-0 text-center min-w-[60px]">
        <p className="text-[11px] uppercase text-rs-muted">
          {d.toLocaleDateString(locale, { weekday: 'short' })}
        </p>
        <p className="text-xl font-display font-bold text-white">{d.getDate()}</p>
        <p className="text-[11px] uppercase text-rs-muted">
          {d.toLocaleDateString(locale, { month: 'short' })}
        </p>
      </div>
      <div className="w-px h-10 bg-rs-border shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{event.series}</p>
        {event.description && (
          <p className="text-rs-muted text-xs truncate">{event.description}</p>
        )}
      </div>
      <p className="text-rs-yellow text-sm font-display font-bold shrink-0">{time}</p>
    </div>
  )
}
