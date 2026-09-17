'use client'

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * A hover explanation.
 *
 * Shows on mouse-over and on keyboard focus, and is announced to screen
 * readers through `aria-describedby` while it is visible. The bubble is
 * rendered into `document.body` with fixed positioning, so it escapes every
 * `overflow: hidden` on the way up — the month grid clips its cells, and a
 * tooltip inside a clipped cell would be cut off at exactly the moment it is
 * needed.
 *
 * It hides on mousedown: a click means the reader is acting, not reading, and
 * a bubble hanging over a freshly opened menu is clutter. Nothing in a tip may
 * be essential — touch screens never hover — so the tip only ever restates or
 * expands what is already on the page.
 */
const subscribeNoop = () => () => {}
/** Touch screens never hover; a tip that needs a tap would fight the click it sits on. */
const canHover = () => window.matchMedia('(hover: hover)').matches

export function Tip({
  content,
  children,
  className,
  width = 288,
}: {
  content: ReactNode
  children: ReactNode
  className?: string
  /** Bubble width in px; clamped to the viewport on small screens. */
  width?: number
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const id = useId()
  const hoverable = useSyncExternalStore(subscribeNoop, canHover, () => false)

  const show = useCallback(() => {
    if (hoverable && anchor.current) setRect(anchor.current.getBoundingClientRect())
  }, [hoverable])
  const hide = useCallback(() => setRect(null), [])

  // Anything that moves the anchor invalidates the measured position; hiding
  // is cheaper and calmer than tracking it.
  useEffect(() => {
    if (!rect) return
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [rect, hide])

  const style = rect ? place(rect, width) : undefined

  return (
    <div
      ref={anchor}
      className={className}
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseDown={hide}
      // Keyboard focus only. A mouse click also focuses the button it lands
      // on, and that focus event would bring the tip straight back over the
      // menu the click just opened — `:focus-visible` is false for clicks.
      onFocus={(e) => { if (e.target.matches(':focus-visible')) show() }}
      onBlur={hide}
      aria-describedby={rect ? id : undefined}
    >
      {children}
      {rect &&
        createPortal(
          <div
            role="tooltip"
            id={id}
            style={style}
            className="pointer-events-none fixed z-[70] rounded-rs border border-rs-border bg-rs-dark p-3 text-left text-xs leading-relaxed text-rs-muted shadow-xl"
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  )
}

/**
 * Above the anchor, centred on it, unless that would leave the viewport:
 * then below, or shifted sideways. The fixed header is 64 px plus the 34 px
 * ticker, so "above" needs about 100 px of room to be readable.
 */
function place(rect: DOMRect, width: number): React.CSSProperties {
  const gap = 8
  const margin = 8
  const vw = window.innerWidth
  const w = Math.min(width, vw - margin * 2)

  let left = rect.left + rect.width / 2 - w / 2
  left = Math.max(margin, Math.min(left, vw - margin - w))

  const above = rect.top > 100 + gap
  return above
    ? { left, width: w, bottom: window.innerHeight - rect.top + gap }
    : { left, width: w, top: rect.bottom + gap }
}
