/**
 * The play triangle as an SVG.
 *
 * It used to be the character "▶" (U+25B6). On iOS that code point takes its
 * emoji presentation — a blue rounded square with a white triangle — so the
 * yellow play circle on the events poster showed a second play button inside
 * the first. An SVG draws the same in every font stack.
 */
export function PlayIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M4 2.5v11l9-5.5-9-5.5Z" />
    </svg>
  )
}
