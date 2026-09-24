/**
 * The two icons both players share for switching between the big player and
 * the corner window, so recordings and the live stream look and behave alike.
 */

/** Big → corner: a frame with a small window in its lower right */
export function MinimizeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" />
      <rect x="8" y="8" width="4.5" height="3.5" rx="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Corner → big: arrows out to two corners */
export function ExpandIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" />
    </svg>
  )
}

/** Out of the browser: a window with an arrow leaving it */
export function PopOutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 9v3.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H7" />
      <path d="M10 2.5h3.5V6M13.5 2.5 8 8" />
    </svg>
  )
}
