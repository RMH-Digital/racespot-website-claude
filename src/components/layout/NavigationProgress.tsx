'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getT, type Lang } from '@/lib/i18n'

/**
 * A 0-to-100 counter for navigations that take a moment.
 *
 * Every page here is server-rendered on demand, so clicking a link fetches
 * from the server before anything changes on screen. Usually that is a tenth
 * of a second and invisible; on a cold route or a slow connection it is long
 * enough that the page looks broken — you click, and nothing happens.
 *
 * What it does *not* do is cover the page. A full-screen curtain for a 300ms
 * wait is worse than the wait: the reader loses the page they were looking at.
 * This is a hairline across the top plus the number, in the brand's own
 * typeface — enough to say "it heard you" and nothing more.
 *
 * The count approaches 90 and decelerates, because we genuinely do not know
 * how far along the request is; a bar that marches confidently to 99 and sits
 * there is a lie told by most progress bars. When the new route renders it
 * snaps to 100, holds long enough to be seen, and fades.
 */

/** Wait this long before showing anything — a fast navigation should stay silent. */
const SHOW_AFTER_MS = 250

/** Never count past this on our own; the remainder belongs to the real arrival. */
const CEILING = 90

/** Share of the remaining distance covered each frame: the deceleration. */
const APPROACH = 0.055

/** How long 100 stays on screen before fading out. */
const HOLD_MS = 200

/** Give up and hide if a navigation never completes (a download, a blocked route). */
const ABANDON_MS = 15_000

type Phase = 'idle' | 'running' | 'done'

export function NavigationProgress({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const pathname = usePathname()

  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  const frame = useRef<number | undefined>(undefined)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  /** The path we are navigating away from; arrival is when pathname differs. */
  const from = useRef<string | null>(null)

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    frame.current = undefined
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    from.current = null
    setPhase('idle')
    setVisible(false)
    setProgress(0)
  }, [clearTimers])

  const start = useCallback(() => {
    clearTimers()
    from.current = window.location.pathname
    setPhase('running')
    setProgress(0)
    setVisible(false)

    // The count begins when the bar appears, not when the click happens.
    // Running it during the silent quarter-second meant that by the time
    // anyone could see it, it was already past fifty — "0 to 100" has to
    // start at 0 on screen.
    timers.current.push(
      setTimeout(() => {
        setVisible(true)
        const tick = () => {
          setProgress((p) => p + (CEILING - p) * APPROACH)
          frame.current = requestAnimationFrame(tick)
        }
        frame.current = requestAnimationFrame(tick)
      }, SHOW_AFTER_MS),
    )
    timers.current.push(setTimeout(reset, ABANDON_MS))
  }, [clearTimers, reset])

  // ── Navigation start: a plain left-click on an internal link ──────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as Element | null)?.closest?.('a')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Same page, or only the hash differs: nothing will be fetched.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      start()
    }

    // Capture phase, so a link that stops propagation still registers.
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [start])

  // Back and forward buttons go through the same wait.
  useEffect(() => {
    function handlePopState() {
      start()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [start])

  // ── Navigation end: the route actually changed ────────────────────────
  useEffect(() => {
    if (phase !== 'running') return
    if (from.current === null || from.current === pathname) return

    clearTimers()
    setPhase('done')
    setProgress(100)

    // Only worth showing the finish if the start was ever shown.
    if (!visible) {
      reset()
      return
    }
    timers.current.push(setTimeout(() => setVisible(false), HOLD_MS))
    timers.current.push(setTimeout(reset, HOLD_MS + 400))
  }, [pathname, phase, visible, clearTimers, reset])

  useEffect(() => clearTimers, [clearTimers])

  if (phase === 'idle') return null

  const shown = Math.min(100, Math.round(progress))

  return (
    <div
      className={`pointer-events-none transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* The line, hard against the top edge above the fixed header.
          Transform rather than width so it stays on the compositor, and no CSS
          transition: the value changes every animation frame, and a transition
          restarted each frame never finishes — the bar stalled around 56%
          while the number carried on to 100. */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-rs-yellow/15 overflow-hidden">
        <div
          className="h-full w-full origin-left bg-linear-to-r from-rs-yellow/60 to-rs-yellow"
          style={{ transform: `scaleX(${shown / 100})` }}
        />
      </div>

      {/* The count, bottom left — the one corner that is empty on every page.
          It first sat under the right end of the line, which put yellow digits
          on top of the yellow "Get a Quote" button. Down here it reads like
          the timing display it is borrowing from, and collides with nothing. */}
      <div className="fixed bottom-6 left-6 z-[60] flex items-baseline gap-1">
        <span
          aria-hidden="true"
          className="font-display font-black tabular-nums leading-none text-rs-yellow text-[34px] md:text-[42px] tracking-tight
                     [text-shadow:0_2px_12px_rgba(10,10,10,0.9)]"
        >
          {shown}
        </span>
        <span
          aria-hidden="true"
          className="font-display font-bold leading-none text-rs-yellow/60 text-[13px] [text-shadow:0_2px_12px_rgba(10,10,10,0.9)]"
        >
          %
        </span>
      </div>

      {/* One announcement instead of a hundred: the digits are hidden from
          assistive technology, this line is not. */}
      <span role="status" className="sr-only">
        {t('a11y.loading')}
      </span>
    </div>
  )
}
