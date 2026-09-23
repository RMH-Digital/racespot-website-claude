'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { getT, type Lang } from '@/lib/i18n'
import { FollowUs } from '@/components/ui/FollowUs'

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

function embedUrl(m: PlayerMedia): string {
  const base = 'https://www.youtube-nocookie.com/embed/'
  if (m.kind === 'playlist') return `${base}videoseries?list=${encodeURIComponent(m.id)}&autoplay=1&rel=0`
  // A broadcast in several parts: the first one plays, the rest follow in the
  // same frame. `playlist` is YouTube's own parameter for exactly this, so
  // the player's next and previous buttons work without us building anything.
  const rest = m.parts && m.parts.length > 1 ? m.parts.slice(1) : []
  const queue = rest.length ? `&playlist=${rest.map(encodeURIComponent).join(',')}` : ''
  return `${base}${encodeURIComponent(m.id)}?autoplay=1&rel=0${queue}`
}

export function VideoPlayerProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [media, setMedia] = useState<PlayerMedia | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  const play = useCallback((m: PlayerMedia) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setMedia(m)
    // The live player pauses for it (LivePlayerProvider).
    window.dispatchEvent(new Event('rs:video-open'))
  }, [])

  const close = useCallback(() => {
    setMedia(null)
    opener.current?.focus()
  }, [])

  useEffect(() => {
    if (!media) return
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
  }, [media, close])

  const t = getT(lang)

  return (
    <PlayerContext.Provider value={{ play }}>
      {children}
      {media &&
        createPortal(
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 sm:p-6 md:p-10"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            <div role="dialog" aria-modal="true" aria-label={media.title} className="w-full max-w-5xl">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {media.kind === 'playlist' && (
                    <p className="section-label mb-1">{t('video.playlist')}</p>
                  )}
                  <h2 className="truncate text-base font-semibold text-white md:text-lg">{media.title}</h2>
                </div>
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={close}
                  aria-label={t('video.close')}
                  title={t('video.close')}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-rs border border-rs-border text-rs-muted transition-colors hover:border-rs-yellow hover:text-rs-yellow"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M3 3l10 10M13 3 3 13" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-rs border border-rs-border bg-rs-dark">
                <iframe
                  key={media.id}
                  src={embedUrl(media)}
                  title={media.title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

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
            </div>
          </div>,
          document.body,
        )}
    </PlayerContext.Provider>
  )
}
