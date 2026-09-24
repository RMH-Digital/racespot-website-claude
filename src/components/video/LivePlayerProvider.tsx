'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'
import { useMediaQuery } from '@/lib/hooks/useLocalTime'

/**
 * The live stream's player, owned by the layout rather than the live page.
 *
 * Jürgen, 2026-09-23: the stream started on its own, sound included, and
 * kept playing in a tab nobody was looking at. Now:
 *
 * - **It starts when the live page opens** (Jürgen, 2026-09-24 — the day
 *   before it waited for a click). Browsers only allow sound without a click
 *   on the page first; someone arriving straight from a link elsewhere gets a
 *   muted start and a "Sound on" button over the picture instead of a player
 *   that silently refuses to start.
 * - **It runs only while the tab is visible.** Hidden, it is paused; back,
 *   it plays again — unless the viewer had paused it themselves.
 * - **On a desktop it follows the viewer.** Scroll the player out of view,
 *   or go to another page of the site, and it carries on in a small window
 *   in the bottom-right corner, with its sound. One click brings the viewer
 *   back to the live page, one closes it.
 * - **On a phone or tablet it stays where it is.** A floating window on a
 *   touch screen covers the page and cannot be moved out of the way, so it is
 *   left out there: leaving the live page stops the stream.
 *
 * The iframe is created once and never moved in the DOM — moving it would
 * reload it. It sits in a portal on <body>, laid over the live page's slot
 * with absolute coordinates while docked, and switched to `position: fixed`
 * when it floats. Only its style changes.
 *
 * Control goes through YouTube's postMessage protocol (`enablejsapi=1`), so
 * no script from Google is loaded on our page.
 */

interface LiveMedia { id: string; title: string }

interface LivePlayerApi {
  /** The stream currently loaded, if any */
  playing: LiveMedia | null
  start: (m: LiveMedia) => void
  stop: () => void
  /** The live page's slot: the player docks onto this element while it is on screen */
  registerDock: (el: HTMLElement | null) => void
}

const LivePlayerContext = createContext<LivePlayerApi | null>(null)

export function useLivePlayer() {
  const ctx = useContext(LivePlayerContext)
  if (!ctx) throw new Error('useLivePlayer needs a LivePlayerProvider above it')
  return ctx
}

/** Makes this element the place the player sits while it is on screen. */
export function useLiveDock(ref: RefObject<HTMLElement | null>) {
  const { registerDock } = useLivePlayer()
  useEffect(() => {
    const el = ref.current
    registerDock(el)
    return () => registerDock(null)
  }, [ref, registerDock])
}

const ORIGIN = 'https://www.youtube-nocookie.com'
/** A pointer that hovers and a screen wide enough to spare the corner */
const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

export function LivePlayerProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = getT(lang)
  const pathname = usePathname()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const { liveStreams, loaded } = useLiveStatus()

  const [playing, setPlaying] = useState<LiveMedia | null>(null)
  const [dock, setDock] = useState<HTMLElement | null>(null)
  const [dockVisible, setDockVisible] = useState(true)
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  /** YouTube's player state: 1 playing, 2 paused, … */
  const ytState = useRef<number>(-1)
  const pausedByUs = useRef(false)
  /** Started without sound because the browser refused it; the button offers it back */
  const [muted, setMuted] = useState(false)

  const start = useCallback((m: LiveMedia) => {
    setMuted(false)
    setPlaying(m)
  }, [])
  const stop = useCallback(() => setPlaying(null), [])

  const registerDock = useCallback((el: HTMLElement | null) => setDock(el), [])

  const command = useCallback((func: 'playVideo' | 'pauseVideo' | 'mute' | 'unMute') => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), ORIGIN)
  }, [])

  // The stream ended, or the page that listed it went away on a phone.
  const streamGone = loaded && playing !== null && !liveStreams.some((s) => s.id === playing.id)
  const leftOnTouch = playing !== null && !isDesktop && dock === null
  useEffect(() => {
    if (streamGone || leftOnTouch) setPlaying(null)
  }, [streamGone, leftOnTouch])

  // Another video opened in the site's player: two soundtracks are one too many.
  useEffect(() => {
    const onOpen = () => { if (playing) command('pauseVideo') }
    window.addEventListener('rs:video-open', onOpen)
    return () => window.removeEventListener('rs:video-open', onOpen)
  }, [playing, command])

  // Listen to the player's state, so a pause the viewer chose is respected.
  useEffect(() => {
    if (!playing) return
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ORIGIN || e.source !== frame.current?.contentWindow) return
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        const state = data?.event === 'onStateChange' ? data.info : data?.info?.playerState
        if (typeof state === 'number') ytState.current = state
      } catch { /* not ours */ }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [playing])

  // Only while the tab is being looked at.
  useEffect(() => {
    if (!playing) return
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (ytState.current === 1 || ytState.current === 3) { pausedByUs.current = true; command('pauseVideo') }
      } else if (pausedByUs.current) {
        pausedByUs.current = false
        command('playVideo')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [playing, command])

  // Is the slot on screen? Mostly out of view counts as out.
  useEffect(() => {
    if (!dock) return
    const io = new IntersectionObserver(([entry]) => setDockVisible(entry.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] })
    io.observe(dock)
    return () => io.disconnect()
  }, [dock])

  // Where the slot is, in document coordinates. Absolute positioning means
  // scrolling needs no update at all; only layout does, and layout above
  // the slot can move it without resizing it, hence the slow interval.
  useEffect(() => {
    if (!dock || !playing) return
    const measure = () => {
      const r = dock.getBoundingClientRect()
      const next = { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height }
      setRect((prev) => (prev && prev.top === next.top && prev.left === next.left && prev.width === next.width && prev.height === next.height ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(dock)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    const id = window.setInterval(measure, 1000)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.clearInterval(id)
    }
  }, [dock, playing])

  const docked = dock !== null && rect !== null && (dockVisible || !isDesktop)
  const floating = !docked && isDesktop
  const onLivePage = /\/live\/?$/.test(pathname ?? '')

  const src = playing
    ? `${ORIGIN}/embed/${encodeURIComponent(playing.id)}?autoplay=1&playsinline=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(typeof window === 'undefined' ? '' : window.location.origin)}`
    : ''

  const onFrameLoad = useCallback(() => {
    // Ask the player to report its state from now on.
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'rs-live', channel: 'widget' }), ORIGIN)
    // Autoplay with sound is the browser's call. If it has not started a
    // couple of seconds in, it was refused: start muted — which every browser
    // allows — and offer the sound on our own button.
    ytState.current = -1
    window.setTimeout(() => {
      if (ytState.current === 1 || ytState.current === 3) return
      command('mute')
      command('playVideo')
      setMuted(true)
    }, 2500)
  }, [command])

  const unmute = useCallback(() => {
    command('unMute')
    command('playVideo')
    setMuted(false)
  }, [command])

  return (
    <LivePlayerContext.Provider value={{ playing, start, stop, registerDock }}>
      {children}
      {playing && (docked || floating) &&
        createPortal(
          <div
            role="region"
            aria-label={playing.title}
            className={floating
              ? 'fixed bottom-4 right-4 z-[80] w-[360px] overflow-hidden rounded-rs border border-rs-border bg-rs-dark shadow-2xl'
              : 'absolute z-[30] overflow-hidden rounded-rs'}
            style={floating || !rect ? undefined : { top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          >
            {floating && (
              <div className="flex items-center gap-2 border-b border-rs-border px-3 py-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rs-live animate-pulse-live" aria-hidden="true" />
                <p className="min-w-0 flex-1 truncate text-xs font-medium text-white">{playing.title}</p>
                {onLivePage ? (
                  <button
                    type="button"
                    onClick={() => dock?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    data-track="live-mini-back"
                    className="shrink-0 text-[11px] font-display font-bold uppercase text-rs-yellow hover:text-white"
                  >
                    {t('live.backToPlayer')}
                  </button>
                ) : (
                  <Link href={localePath(lang, '/live')} data-track="live-mini-back" className="shrink-0 text-[11px] font-display font-bold uppercase text-rs-yellow hover:text-white">
                    {t('live.backToPlayer')}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={stop}
                  data-track="live-mini-close"
                  aria-label={t('video.close')}
                  title={t('video.close')}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-rs text-rs-muted hover:bg-rs-gray hover:text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 3l10 10M13 3 3 13" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
            <div className={floating ? 'relative aspect-video' : 'absolute inset-0'}>
              <iframe
                ref={frame}
                src={src}
                title={playing.title}
                onLoad={onFrameLoad}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {muted && (
                <button
                  type="button"
                  onClick={unmute}
                  data-track="live-sound-on"
                  // Big enough to be the first thing seen on a muted picture;
                  // smaller in the corner player, where space is short.
                  className={`absolute z-10 flex items-center gap-2 rounded-rs bg-rs-yellow font-display font-bold uppercase tracking-wider text-rs-black shadow-lg ring-4 ring-rs-yellow/30 transition-colors hover:bg-white
                    ${floating ? 'left-2 top-2 px-2.5 py-1.5 text-[11px]' : 'left-4 top-4 px-4 py-3 text-sm md:left-5 md:top-5 md:px-5 md:text-base'}`}
                >
                  <svg width={floating ? 14 : 20} height={floating ? 14 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" />
                  </svg>
                  {t('live.soundOn')}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </LivePlayerContext.Provider>
  )
}
