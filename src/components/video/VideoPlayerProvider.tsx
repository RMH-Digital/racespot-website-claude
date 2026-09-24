'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { getT, type Lang } from '@/lib/i18n'
import { FollowUs } from '@/components/ui/FollowUs'
import { useMediaQuery } from '@/lib/hooks/useLocalTime'
import { ExpandIcon, MinimizeIcon, PopOutIcon } from './PlayerIcons'
import { openPip, pipSupported } from './pip'

/**
 * One player for the whole site.
 *
 * Any card, row or button calls `play()` and the recording opens in a dialog
 * over the current page — the reader never leaves racespot.tv to watch a past
 * broadcast. The frame comes from youtube-nocookie.com, the mode the privacy
 * policy describes for embedded video: no cookies until playback starts.
 *
 * Escape and the backdrop close it, focus goes to the close button and comes
 * back to whatever opened the player, and the page behind stops scrolling.
 *
 * **Minimise** (Jürgen, 2026-09-24, desktop only like the live player): the
 * dialog shrinks into the bottom-right corner and the page is usable again —
 * scroll, read, move to another page; the recording keeps playing. Expand
 * brings the dialog back. The iframe is the same element in both forms, only
 * the classes around it change, so the video never restarts. One video at a
 * time: opening a recording stops the live stream, starting the live stream
 * closes the recording (`rs:video-open` / `rs:live-start`).
 */
export type PlayerMedia =
  /** `parts` lists every id of a broadcast that went out in several streams, `id` being the first */
  | { kind: 'video'; id: string; title: string; parts?: string[] }
  | { kind: 'playlist'; id: string; title: string }

const PlayerContext = createContext<{ play: (m: PlayerMedia) => void } | null>(null)

export function useVideoPlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('useVideoPlayer needs a VideoPlayerProvider above it')
  return ctx
}

export function youtubeWatchUrl(m: PlayerMedia): string {
  return m.kind === 'playlist' ? `https://www.youtube.com/playlist?list=${m.id}` : `https://www.youtube.com/watch?v=${m.id}`
}

const ORIGIN = 'https://www.youtube-nocookie.com'

/**
 * `enablejsapi` lets the player report where it is (for "own window", which
 * continues at the same second); `start` is that second when reopening.
 */
function embedUrl(m: PlayerMedia, start = 0): string {
  const base = `${ORIGIN}/embed/`
  const api = typeof window === 'undefined' ? '' : `&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
  const at = start > 0 ? `&start=${Math.floor(start)}` : ''
  if (m.kind === 'playlist') return `${base}videoseries?list=${encodeURIComponent(m.id)}&autoplay=1&rel=0${api}`
  // A broadcast in several parts: the first one plays, the rest follow in the
  // same frame. `playlist` is YouTube's own parameter for exactly this, so
  // the player's next and previous buttons work without us building anything.
  const rest = m.parts && m.parts.length > 1 ? m.parts.slice(1) : []
  const queue = rest.length ? `&playlist=${rest.map(encodeURIComponent).join(',')}` : ''
  return `${base}${encodeURIComponent(m.id)}?autoplay=1&rel=0${queue}${api}${at}`
}

/** Same rule as the live player: a hovering pointer and room for a corner window */
const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
const noop = () => () => {}

export function VideoPlayerProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [media, setMedia] = useState<PlayerMedia | null>(null)
  const [miniRequested, setMini] = useState(false)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  // A window resized below the desktop rule turns a corner player back into
  // the dialog rather than leaving it floating on a phone-sized screen.
  const mini = miniRequested && isDesktop
  const opener = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  /** Seconds into the video, as the player last reported */
  const position = useRef(0)
  const canPopOut = useSyncExternalStore(noop, pipSupported, () => false) && isDesktop

  // The player's reports, for the position.
  useEffect(() => {
    if (!media) return
    position.current = 0
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ORIGIN || e.source !== frame.current?.contentWindow) return
      try {
        const t = JSON.parse(e.data)?.info?.currentTime
        if (typeof t === 'number') position.current = t
      } catch { /* not ours */ }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [media])

  const onFrameLoad = useCallback(() => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'rs-video', channel: 'widget' }), ORIGIN)
  }, [])

  const play = useCallback((m: PlayerMedia) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setMini(false)
    setMedia(m)
    // The live player stops for it (LivePlayerProvider).
    window.dispatchEvent(new Event('rs:video-open'))
  }, [])

  const close = useCallback(() => {
    setMedia(null)
    setMini(false)
    opener.current?.focus()
  }, [])

  // The live stream started: one video at a time.
  useEffect(() => {
    const onLive = () => { setMedia(null); setMini(false) }
    window.addEventListener('rs:live-start', onLive)
    return () => window.removeEventListener('rs:live-start', onLive)
  }, [])

  // Dialog behaviour only while it is a dialog: the corner player leaves the
  // page scrollable and the keyboard alone.
  useEffect(() => {
    if (!media || mini) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    closeBtn.current?.focus()
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [media, mini, close])

  // Into its own always-on-top window, at the same second; the page's player
  // closes (one video at a time).
  const popOut = useCallback(() => {
    if (!media) return
    void openPip(embedUrl(media, position.current), media.title).then((ok) => { if (ok) close() })
  }, [media, close])

  const t = getT(lang)
  const iconBtn = mini
    ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-rs text-rs-muted transition-colors hover:bg-rs-gray hover:text-white'
    : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-rs border border-rs-border text-rs-muted transition-colors hover:border-rs-yellow hover:text-rs-yellow'

  return (
    <PlayerContext.Provider value={{ play }}>
      {children}
      {media &&
        createPortal(
          <div
            className={mini
              ? 'fixed bottom-4 right-4 z-[85] w-[360px]'
              : 'fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 sm:p-6 md:p-10'}
            onMouseDown={(e) => {
              if (!mini && e.target === e.currentTarget) close()
            }}
          >
            <div
              role={mini ? 'region' : 'dialog'}
              aria-modal={mini ? undefined : true}
              aria-label={media.title}
              className={mini ? 'w-full overflow-hidden rounded-rs border border-rs-border bg-rs-dark shadow-2xl' : 'w-full max-w-5xl'}
            >
              <div className={mini ? 'flex items-center gap-2 border-b border-rs-border px-3 py-2' : 'mb-3 flex items-start justify-between gap-4'}>
                <div className="min-w-0 flex-1">
                  {media.kind === 'playlist' && !mini && (
                    <p className="section-label mb-1">{t('video.playlist')}</p>
                  )}
                  <h2 className={mini ? 'truncate text-xs font-medium text-white' : 'truncate text-base font-semibold text-white md:text-lg'}>{media.title}</h2>
                </div>
                {canPopOut && (
                  <button
                    type="button"
                    onClick={popOut}
                    data-track="video-popout"
                    aria-label={t('video.popOut')}
                    title={t('video.popOutHint')}
                    className={iconBtn}
                  >
                    <PopOutIcon size={mini ? 12 : 16} />
                  </button>
                )}
                {isDesktop && (
                  <button
                    type="button"
                    onClick={() => setMini(!mini)}
                    data-track={mini ? 'video-expand' : 'video-minimize'}
                    aria-label={mini ? t('video.expand') : t('video.minimize')}
                    title={mini ? t('video.expand') : t('video.minimize')}
                    className={iconBtn}
                  >
                    {mini ? <ExpandIcon size={12} /> : <MinimizeIcon size={16} />}
                  </button>
                )}
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={close}
                  aria-label={t('video.close')}
                  title={t('video.close')}
                  className={iconBtn}
                >
                  <svg width={mini ? 12 : 16} height={mini ? 12 : 16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={mini ? 2 : 1.75} aria-hidden="true">
                    <path d="M3 3l10 10M13 3 3 13" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className={mini ? 'relative aspect-video bg-rs-dark' : 'relative aspect-video overflow-hidden rounded-rs border border-rs-border bg-rs-dark'}>
                <iframe
                  ref={frame}
                  key={media.id}
                  src={embedUrl(media)}
                  onLoad={onFrameLoad}
                  title={media.title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              {!mini && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={youtubeWatchUrl(media)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                  >
                    {t('video.openOnYouTube')} ↗
                  </a>
                  <FollowUs lang={lang} dropUp />
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </PlayerContext.Provider>
  )
}
