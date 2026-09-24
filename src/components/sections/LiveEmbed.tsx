'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { YouTubeLiveStream } from '@/lib/youtube-utils'
import { formatViewCount } from '@/lib/youtube-utils'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { FollowUs } from '@/components/ui/FollowUs'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'
import { useLocalFormat } from '@/lib/hooks/useLocalTime'
import { useLiveDock, useLivePlayer } from '@/components/video/LivePlayerProvider'
import { UpcomingRow } from '@/components/sections/calendar/UpcomingRow'
import { ExpandIcon, MinimizeIcon, PopOutIcon } from '@/components/video/PlayerIcons'
import type { CalendarEvent } from '@/lib/sheets'


interface LiveEmbedProps {
  lang: Lang
  liveStreams: YouTubeLiveStream[]
  upcomingEvents?: CalendarEvent[]
}

export function LiveEmbed({ lang, liveStreams: initialStreams, upcomingEvents = [] }: LiveEmbedProps) {
  const t = getT(lang)
  const [liveStreams, setLiveStreams] = useState(initialStreams)
  const [activeId, setActiveId] = useState(initialStreams[0]?.id || '')

  // Stream updates come from LiveStatusProvider, which already polls
  // /api/live-streams every 60 s for the header and ticker — no second poll here.
  const { liveStreams: polled, loaded } = useLiveStatus()
  const { playing, start, minimized, expand, minimize, canFloat, popOut, canPopOut } = useLivePlayer()
  const slot = useRef<HTMLDivElement>(null)
  useLiveDock(slot)

  // The stream starts as soon as the page opens (Jürgen, 2026-09-24). Only
  // when nothing is playing yet: a stream already running in the corner
  // player is not restarted, it just docks back onto this page.
  const autoStarted = useRef(false)
  useEffect(() => {
    const first = liveStreams.find((s) => s.id === activeId) ?? liveStreams[0]
    if (autoStarted.current || playing || !first) return
    autoStarted.current = true
    start({ id: first.id, title: first.title })
  }, [playing, liveStreams, activeId, start])

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

  const intro = streamIntro(activeStream.description)
  const isPlayingHere = playing?.id === activeStream.id

  return (
    <div className="pt-4 md:pt-8 min-h-screen">
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
        <h1 className="display-title mb-6 md:mb-8">{t('live.liveNow')}</h1>

        {/* Player and chat side by side from lg up — the layout every
            streaming site has taught viewers, and at 1440 px the chat under
            the player sat a full screen below it. On a phone they stack. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {/* Stream tabs — shown directly above video for 2+ streams */}
            {liveStreams.length > 1 && (
              <div className="flex gap-0 border-b border-rs-border mb-0 overflow-x-auto scrollbar-hide">
                {liveStreams.map((stream) => {
                  const isActive = stream.id === activeStream.id
                  return (
                    <button
                      key={stream.id}
                      onClick={() => {
                      setActiveId(stream.id)
                      if (playing) start({ id: stream.id, title: stream.title })
                    }}
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

            {/* The player's place on the page. Nothing plays until the
                button is pressed; then the site-wide live player
                (LivePlayerProvider) lays itself over this box, and follows
                the viewer into a corner on a desktop when it scrolls away. */}
            <div
              ref={slot}
              className={`relative aspect-video bg-rs-dark border border-rs-border overflow-hidden
                ${liveStreams.length > 1 ? 'rounded-b-rs border-t-0' : 'rounded-rs'}`}
            >
              {/* Sent to the corner: the empty slot says where it went and
                  brings it back. */}
              {isPlayingHere && minimized && (
                <button
                  type="button"
                  onClick={expand}
                  data-track="live-expand-slot"
                  className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 text-rs-muted hover:text-white"
                >
                  <ExpandIcon size={28} />
                  <span className="text-xs font-display font-bold uppercase tracking-wider">{t('video.expand')}</span>
                </button>
              )}
              {!isPlayingHere && (
                <button
                  type="button"
                  onClick={() => start({ id: activeStream.id, title: activeStream.title })}
                  className="group absolute inset-0 flex h-full w-full items-center justify-center"
                  aria-label={`${t('live.playStream')}: ${activeStream.title}`}
                >
                  {activeStream.thumbnail && (
                    <Image
                      src={activeStream.thumbnail}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 820px, (min-width: 1024px) 66vw, 100vw"
                      className="object-cover opacity-70 transition-opacity group-hover:opacity-90"
                      priority
                    />
                  )}
                  <span className="relative flex flex-col items-center gap-3">
                    <span className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-rs-yellow text-rs-black shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-1">
                        <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
                      </svg>
                    </span>
                    <span className="rounded-rs bg-black/70 px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wider text-white">
                      {t('live.playStream')}
                    </span>
                  </span>
                </button>
              )}
            </div>

            {/* Stream info — the viewer count is in the badge row above */}
            <div className="mt-5">
              <div className="mb-2 flex flex-col gap-3">
                <h2 className="text-lg md:text-2xl font-bold text-white">
                  {activeStream.title}
                </h2>
                {/* Under the player, not over it: YouTube's own controls
                    (settings, captions) sit in the picture's top corners. */}
                {isPlayingHere && !minimized && (canFloat || canPopOut) && (
                  <div className="flex flex-wrap gap-2">
                {canPopOut && (
                  <button
                    type="button"
                    onClick={popOut}
                    data-track="live-popout"
                    title={t('video.popOutHint')}
                    className="shrink-0 flex items-center gap-2 rounded-rs border border-rs-border px-3 py-2 text-[11px] font-display font-bold uppercase tracking-wider text-rs-muted transition-colors hover:border-rs-yellow hover:text-rs-yellow"
                  >
                    <PopOutIcon size={14} />
                    {t('video.popOut')}
                  </button>
                )}
                {canFloat && (
                  <button
                    type="button"
                    onClick={minimize}
                    data-track="live-minimize"
                    title={t('video.minimize')}
                    className="shrink-0 flex items-center gap-2 rounded-rs border border-rs-border px-3 py-2 text-[11px] font-display font-bold uppercase tracking-wider text-rs-muted transition-colors hover:border-rs-yellow hover:text-rs-yellow"
                  >
                    <MinimizeIcon size={14} />
                    {t('video.minimize')}
                  </button>
                )}
                  </div>
                )}
              </div>
              {intro && (
                <p className="text-rs-muted text-sm max-w-2xl line-clamp-3">{intro}</p>
              )}
            </div>

            <FollowUs lang={lang} size="md" stretch className="mt-6" />
          </div>

          {/* Chat embed */}
          <div className="flex flex-col border border-rs-border rounded-rs overflow-hidden lg:self-start lg:sticky lg:top-[114px]">
            <div className="bg-rs-dark px-4 py-2.5 border-b border-rs-border">
              <p className="text-xs font-display font-bold uppercase tracking-wider text-rs-muted">
                {t('live.liveChat')}
              </p>
            </div>
            {/* dark_theme=1: YouTube's chat defaults to its light theme, a white
                box in a black page. The dark one matches; the container is dark
                too so the frame never flashes white while it loads. */}
            <div className="relative h-[420px] lg:h-[calc(100vh-190px)] lg:max-h-[640px] bg-rs-dark">
              <iframe
                key={`chat-${activeStream.id}`}
                src={`https://www.youtube.com/live_chat?v=${activeStream.id}&embed_domain=racespot.tv&dark_theme=1`}
                title={t('live.liveChat')}
                className="absolute inset-0 w-full h-full"
                style={{ colorScheme: 'dark' }}
              />
            </div>
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

// ─── Helpers ────────────────────────────────────────────────

/**
 * The opening of a YouTube description, fit to stand under the player.
 *
 * Descriptions are written for YouTube: emoji as bullet points, then a block
 * of social links ("▶ Racespot on Social  Instagram: https://…"). Under our
 * player that was three lines of pictographs and bare URLs, and the links
 * are already in the "More channels" button beside it. So: everything before
 * the first link block or URL, without the emoji.
 */
function streamIntro(description: string): string {
  const cut = description.search(/▶|https?:\/\/|racespot on social/i)
  const head = cut >= 0 ? description.slice(0, cut) : description
  return head
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Sub-components ─────────────────────────────────────────
