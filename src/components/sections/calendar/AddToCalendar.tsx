'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CalendarEvent } from '@/lib/sheets'
import type { Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { seriesFeedUrl } from './feed'

/**
 * The calendar button on a broadcast: one click opens two choices.
 *
 * - **This broadcast** — a one-off `.ics` download with a fifteen-minute
 *   alarm, raised by the reader's own calendar.
 * - **The whole series** — a `webcal://` subscription filtered to this series,
 *   so every round turns up by itself.
 * - **The bell** — when YouTube already lists the stream, a link to it, where
 *   "Notify me" does what people expect from YouTube.
 *
 * We store nothing and ask for nothing either way. The menu is rendered into
 * `document.body` with fixed positioning: in the month grid the button sits
 * at the bottom of a ~97 px cell inside an `overflow: hidden` wrapper, and a
 * menu positioned inside that would be clipped to a sliver. While open it
 * re-measures the button on scroll and resize so it stays attached.
 */
const MENU_WIDTH = 256

export function AddToCalendar({
  lang,
  event,
  t,
  compact = false,
  tone = 'dark',
  triggerRef,
  labeled = false,
}: {
  lang: Lang
  event: CalendarEvent
  t: (k: TranslationKey) => string
  compact?: boolean
  /** `light` for a yellow ground, where muted grey and a yellow hover would both vanish */
  tone?: 'dark' | 'light'
  /** Lets a parent reach the trigger — the calendar cards open this menu from their whole surface */
  triggerRef?: React.RefObject<HTMLButtonElement | null>
  /** A full button with the words beside the icon, for a row of large buttons (the live page's next broadcast) */
  labeled?: boolean
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const open = rect !== null
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useId()

  function close(returnFocus = false) {
    setRect(null)
    if (returnFocus) trigger.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent | TouchEvent) {
      const target = e.target as Node
      if (trigger.current?.contains(target) || menu.current?.contains(target)) return
      setRect(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setRect(null)
      trigger.current?.focus()
    }
    // Follow the button while the page scrolls or resizes, rather than
    // closing: the page scrolls smoothly, and a click that lands while a
    // scroll is still easing out would otherwise open a menu that vanishes
    // before the reader sees it.
    let frame = 0
    const follow = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (trigger.current) setRect(trigger.current.getBoundingClientRect())
      })
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', follow, true)
    window.addEventListener('resize', follow)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', follow, true)
      window.removeEventListener('resize', follow)
    }
  }, [open])

  return (
    <div className="relative z-10 shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        ref={(el) => {
          trigger.current = el
          if (triggerRef) triggerRef.current = el
        }}
        type="button"
        onClick={() => (open ? close() : setRect(trigger.current!.getBoundingClientRect()))}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t('calendar.addToCalendar')}: ${event.series}`}
        title={t('calendar.addToCalendar')}
        className={labeled
          ? `btn-outline whitespace-nowrap w-full sm:w-auto ${open ? 'border-rs-yellow' : ''}`
          : `flex items-center justify-center rounded-rs transition-colors
          ${compact
            ? // 24px: the month grid's cells are ~97px wide, so the 44px target
              // used everywhere else simply does not fit. 24 is the floor WCAG
              // 2.2 sets, and the same size the event dots settled on.
              (tone === 'light' ? 'h-6 w-6 text-rs-black/55 hover:text-rs-black' : 'h-6 w-6 text-rs-muted hover:text-rs-yellow')
            : 'h-11 w-11 border border-rs-border text-rs-muted hover:border-rs-yellow hover:text-rs-yellow'}
          ${open ? (tone === 'light' ? 'text-rs-black' : 'text-rs-yellow') : ''}`}
      >
        <svg
          width={compact ? 13 : 16}
          height={compact ? 13 : 16}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="12" height="11" rx="1.5" />
          <path d="M2 6.5h12M5.5 1.5V4M10.5 1.5V4" strokeLinecap="round" />
          <path d="M8 8.5v3.5M6.25 10.25 8 12l1.75-1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {labeled && <span>{t('calendar.addToCalendar')}</span>}
      </button>

      {rect &&
        createPortal(
          <div
            ref={menu}
            id={menuId}
            role="menu"
            style={placeMenu(rect)}
            className="fixed z-[80] overflow-hidden rounded-rs border border-rs-border bg-rs-dark text-left shadow-xl"
          >
            <a
              role="menuitem"
              href={`/api/calendar/${encodeURIComponent(event.id)}?lang=${lang}`}
              download
              onClick={() => close()}
              autoFocus
              className="block px-4 py-3 hover:bg-rs-gray focus-visible:bg-rs-gray transition-colors"
            >
              <span className="block text-sm font-medium text-white">{t('calendar.addToCalendar')}</span>
              <span className="block text-[11px] text-rs-muted mt-0.5">
                {t('calendar.thisBroadcast')} · {t('calendar.reminderNote')}
              </span>
            </a>
            <a
              role="menuitem"
              href={seriesFeedUrl(event.series)}
              onClick={() => close()}
              className="block px-4 py-3 border-t border-rs-border/60 hover:bg-rs-gray focus-visible:bg-rs-gray transition-colors"
            >
              <span className="block text-sm font-medium text-white">{t('calendar.subscribeSeries')}</span>
              <span className="block text-[11px] text-rs-muted mt-0.5 truncate">{event.series}</span>
            </a>
            {/* The stream is already announced on YouTube: its page carries
                the bell, which is the reminder most viewers already use. */}
            {event.videoId && (
              <a
                role="menuitem"
                href={`https://www.youtube.com/watch?v=${event.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => close()}
                className="block px-4 py-3 border-t border-rs-border/60 hover:bg-rs-gray focus-visible:bg-rs-gray transition-colors"
              >
                <span className="block text-sm font-medium text-white">
                  <span aria-hidden="true">🔔 </span>{t('calendar.remindOnYouTube')}
                </span>
                <span className="block text-[11px] text-rs-muted mt-0.5">{t('calendar.remindOnYouTubeHint')}</span>
              </a>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}

/**
 * Above the button, right edges aligned — the button is the rightmost thing
 * in its row, so the menu grows into the row rather than off the page. Left
 * edges when the row starts too close to the left, below when the button is
 * too near the top (the fixed header and ticker take the first ~100 px).
 */
function placeMenu(rect: DOMRect): React.CSSProperties {
  const gap = 6
  const margin = 8
  const vw = window.innerWidth
  const w = Math.min(MENU_WIDTH, vw - margin * 2)
  const left = rect.right - w >= margin ? rect.right - w : Math.min(rect.left, vw - margin - w)
  const above = rect.top > 220
  return above
    ? { left, width: w, bottom: window.innerHeight - rect.top + gap }
    : { left, width: w, top: rect.bottom + gap }
}
