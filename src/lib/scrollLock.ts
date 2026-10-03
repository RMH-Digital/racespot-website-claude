/**
 * Stop the page behind an overlay from scrolling, on every browser.
 *
 * `overflow: hidden` on <body> alone is not enough: Safari on the iPhone
 * ignores it and kept scrolling the page behind the mobile menu (reported
 * 2026-09-24). Pinning the body with `position: fixed` at the current offset
 * stops every browser, and the offset is restored on release so the reader
 * lands where they were. Returns the release function — hand it to an
 * effect's cleanup.
 *
 * Used by the mobile menu (Header) and the video dialog (VideoPlayerProvider);
 * until 2026-10-02 the dialog only set overflow, and on an iPhone the page
 * scrolled on behind it.
 */
export function lockScroll(): () => void {
  const y = window.scrollY
  const { body } = document
  const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow }
  body.style.position = 'fixed'
  body.style.top = `-${y}px`
  body.style.width = '100%'
  body.style.overflow = 'hidden'
  return () => {
    Object.assign(body.style, previous)
    // Instant, not smooth: the page's smooth scrolling would animate the
    // jump back and land the reader short of where they were.
    window.scrollTo({ top: y, behavior: 'instant' })
  }
}
