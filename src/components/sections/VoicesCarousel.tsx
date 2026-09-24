'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@/lib/hooks/useLocalTime'

export interface Voice {
  id: string
  quote: string
  name: string
  role?: string
  lang?: string
}

/** How long one quote stays before the next — long enough to read the longest */
const INTERVAL_MS = 9000
const SWIPE_PX = 48

/**
 * One quote at a time, full width, large — a pull quote rather than a card
 * grid (Jürgen, 2026-09-24).
 *
 * All slides share one grid cell, so the section is as tall as the longest
 * quote and nothing below it jumps when the next one fades in. It moves on
 * by itself every nine seconds, pauses while the pointer or the keyboard is
 * on it, and does not move at all under prefers-reduced-motion — the arrows
 * and dots still do. A swipe works on touch screens.
 */
export function VoicesCarousel({
  voices,
  labels,
}: {
  voices: Voice[]
  labels: { prev: string; next: string; goTo: string; carousel: string }
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const touchX = useRef<number | null>(null)
  const count = voices.length

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    if (paused || reduced || count < 2) return
    const id = window.setTimeout(() => go(index + 1), INTERVAL_MS)
    return () => window.clearTimeout(id)
  }, [index, paused, reduced, count, go])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1))
      }}
      className="relative"
    >
      <div className="grid" aria-live={paused || reduced ? 'polite' : 'off'}>
        {voices.map((v, i) => (
          <figure
            key={v.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 flex flex-col items-center text-center transition-opacity duration-700 motion-reduce:transition-none
              ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            {/* One mark above, not quotation marks around: the quotes are in
                their own language, the page in another, and „…“ and “…”
                would each be wrong for half of them. */}
            <svg width="36" height="28" viewBox="0 0 28 22" fill="currentColor" aria-hidden="true" className="mb-5 text-rs-yellow">
              <path d="M0 22V13.2C0 5.9 4.1 1.4 11.2 0l1.3 3.1C8.4 4.6 6.5 7.3 6.4 10.6H12V22H0Zm16 0V13.2C16 5.9 20.1 1.4 27.2 0l1.3 3.1c-4.1 1.5-6 4.2-6.1 7.5H28V22H16Z" />
            </svg>
            {/* Line breaks in the original become spaces: the words are the
                reviewer's, the returns were only how the platform's text box
                wrapped them, and kept they made a quote of seven short lines.
                Sized so the longest one, heading and controls fit a 13-inch
                laptop screen (MacBook Air, 1440 × 900) in one view. */}
            <blockquote lang={v.lang} className="max-w-3xl">
              <p className="text-[17px] leading-[1.6] text-white md:text-[20px] lg:text-[22px] lg:leading-[1.55]">{v.quote.replace(/\s*\n+\s*/g, ' ')}</p>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-rs-yellow" aria-hidden="true" />
              <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-white">{v.name}</span>
              {v.role && <span className="text-sm text-rs-muted">{v.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={labels.prev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-rs-border text-rs-muted transition-colors hover:border-rs-yellow hover:text-rs-yellow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <div className="flex items-center gap-1">
            {voices.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`${labels.goTo} ${i + 1}`}
                aria-current={i === index}
                className="flex h-11 w-6 items-center justify-center"
              >
                <span className={`block h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-rs-yellow' : 'w-1.5 bg-rs-border'}`} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={labels.next}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-rs-border text-rs-muted transition-colors hover:border-rs-yellow hover:text-rs-yellow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
