'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getT, type Lang } from '@/lib/i18n'

/**
 * The 0-to-100 curtain, borrowed from rmh-digital.de and wired to something
 * real.
 *
 * RMH's version is an intro: a full-bleed panel with the wordmark bottom left
 * and a three-digit count bottom right, running for a fixed 0.85s once per
 * session before sliding up out of the way. The count is choreography — it is
 * not connected to anything loading.
 *
 * Here it is connected. Every page is server-rendered on demand, so clicking a
 * link fetches from the server before anything changes on screen. Usually that
 * is a tenth of a second; on a cold route or a poor connection it is long
 * enough that the site looks broken — you click, and nothing happens. So the
 * curtain appears only when a navigation actually takes longer than a quarter
 * of a second, and it leaves the moment the new page is there.
 *
 * Which means the count has to be honest about what it does not know. It
 * approaches 90 and decelerates; the last ten per cent belong to the real
 * arrival. A bar that marches confidently to 99 and sits there is a lie most
 * progress bars tell.
 */

/** Stay silent below this: a fast navigation should show nothing at all. */
const SHOW_AFTER_MS = 250

/** The count never passes this on its own. */
const CEILING = 90

/** Share of the remaining distance covered per frame — the deceleration. */
const APPROACH = 0.055

/** How long 100 stands before the curtain starts moving. */
const HOLD_MS = 260

/** Must match the slide duration in the class list below. */
const SLIDE_MS = 620

/** Give up if a navigation never completes (a download, a blocked route). */
const ABANDON_MS = 15_000

type Phase = 'idle' | 'running' | 'leaving'

export function NavigationProgress({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const pathname = usePathname()

  const [phase, setPhase] = useState<Phase>('idle')
  const [visible, setVisible] = useState(false)

  /**
   * The count is deliberately not React state.
   *
   * It was, and it did not move: during the pending route transition React
   * never flushed the per-frame updates, so the number sat at 000 until the
   * new page arrived and it jumped straight to 100. The animation frames were
   * running the whole time — 105 of them in a 1.5s navigation — React just was
   * not re-rendering for them. Writing to the two nodes directly sidesteps the
   * scheduler entirely, which is what you want for a sixty-times-a-second
   * counter regardless.
   */
  const progress = useRef(0)
  const rootEl = useRef<HTMLDivElement>(null)
  const numberEl = useRef<HTMLSpanElement>(null)
  const barEl = useRef<HTMLDivElement>(null)

  const frame = useRef<number | undefined>(undefined)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  /** The path we left; arrival is when `pathname` differs from it. */
  const from = useRef<string | null>(null)
  /** Was the curtain ever actually on screen? If not, leave without a show. */
  const wasShown = useRef(false)

  /** Write the current value to the two nodes that show it. */
  const paint = useCallback((value: number) => {
    progress.current = value
    const shown = Math.min(100, Math.round(value))
    if (numberEl.current) numberEl.current.textContent = String(shown).padStart(3, '0')
    if (barEl.current) barEl.current.style.transform = `scaleX(${shown / 100})`
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    frame.current = undefined
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    from.current = null
    wasShown.current = false
    setPhase('idle')
    setVisible(false)
    paint(0)
    document.body.style.overflow = ''
  }, [clearTimers, paint])

  const start = useCallback(() => {
    clearTimers()
    from.current = window.location.pathname
    wasShown.current = false
    setPhase('running')
    paint(0)
    setVisible(false)

    // The count starts when the curtain appears, not when the click happens.
    // Running it through the silent quarter-second meant that by the time
    // anyone could see it, it was already past fifty.
    timers.current.push(
      setTimeout(() => {
        wasShown.current = true
        setVisible(true)
        document.body.style.overflow = 'hidden'
        const tick = () => {
          paint(progress.current + (CEILING - progress.current) * APPROACH)
          frame.current = requestAnimationFrame(tick)
        }
        frame.current = requestAnimationFrame(tick)
      }, SHOW_AFTER_MS),
    )
    timers.current.push(setTimeout(reset, ABANDON_MS))
  }, [clearTimers, paint, reset])

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

  // Back and forward go through the same wait.
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

    // Never shown, so never seen: tidy up without a performance.
    if (!wasShown.current) {
      reset()
      return
    }

    paint(100)
    timers.current.push(
      setTimeout(() => {
        // Animated here rather than by a class or an inline style, because a
        // CSS transition on transform would not run: measured live, the style
        // said translateY(-100%) while the computed transform stayed at the
        // identity matrix for the whole 620ms and the curtain simply
        // disappeared. Opacity transitioned fine in the same element, so this
        // is specific to transform. element.animate() is imperative and does
        // not depend on the browser having seen a from-value first.
        // globals.css neutralises CSS animation for prefers-reduced-motion,
        // but element.animate() is script and sails straight past it — so the
        // check has to happen here.
        const calmly = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (!calmly) {
          rootEl.current?.animate(
            [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
            { duration: SLIDE_MS, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' },
          )
        }
        setPhase('leaving')
      }, HOLD_MS),
    )
    timers.current.push(setTimeout(reset, HOLD_MS + SLIDE_MS))
  }, [pathname, phase, clearTimers, paint, reset])

  useEffect(
    () => () => {
      clearTimers()
      document.body.style.overflow = ''
    },
    [clearTimers],
  )

  if (phase === 'idle') return null

  return (
    <div
      ref={rootEl}
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-rs-black"
      style={{
        opacity: visible || phase === 'leaving' ? 1 : 0,
        transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, opacity',
      }}
    >
      {/* aria-hidden sits on the visuals, not on the wrapper: a screen reader
          should hear "loading page" once, not a wordmark and a number that
          changes sixty times a second. */}
      {/* w-full is load-bearing: container-rs centres itself with auto side
          margins, and an auto margin on the cross axis cancels a flex item's
          stretch — without it this row shrank to its contents and the number
          drifted into the middle of the screen instead of the right edge. */}
      <div
        aria-hidden="true"
        className="container-rs w-full pb-10 md:pb-14 flex items-end justify-between gap-6"
      >
        <span className="font-display font-bold uppercase tracking-[0.25em] text-rs-muted text-[11px] md:text-[13px] pb-2 md:pb-4">
          Racespot
        </span>

        {/* Three digits like the original, so the number never changes width
            as it climbs and the line underneath stays still. */}
        <span
          ref={numberEl}
          className="font-display font-black tabular-nums leading-[0.8] text-rs-yellow tracking-tight"
          style={{ fontSize: 'clamp(64px, 15vw, 170px)' }}
        >
          000
        </span>
      </div>

      {/* The same yellow hairline the hero uses, as the actual progress. */}
      <div aria-hidden="true" className="h-[3px] w-full bg-rs-yellow/10 overflow-hidden">
        {/* No CSS transition here: the value changes every animation frame,
            and a transition restarted each frame never arrives — the bar
            stalled around 56% while the number carried on to 100. */}
        <div
          ref={barEl}
          className="h-full w-full origin-left bg-linear-to-r from-rs-yellow/50 to-rs-yellow"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* One announcement, rather than a hundred changing numbers. */}
      <span role="status" className="sr-only">
        {t('a11y.loading')}
      </span>
    </div>
  )
}
