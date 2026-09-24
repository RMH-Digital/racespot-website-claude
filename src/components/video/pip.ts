'use client'

/**
 * A player in its own always-on-top window, outside the browser.
 *
 * Built on Document Picture-in-Picture (Chrome and Edge 116+, on macOS and
 * Windows). The page opens a small window the operating system keeps above
 * every other app, and we put a YouTube player into it. The classic video
 * Picture-in-Picture (`video.requestPictureInPicture()`) cannot be used: the
 * <video> lives inside YouTube's cross-origin frame, out of our reach, and
 * YouTube's embed has no Picture-in-Picture control of its own.
 *
 * Safari and Firefox have no Document PiP. There the button is not shown,
 * and the browser's own way still works on the embed: a double right-click
 * on the video in Safari, the overlay button in Firefox — both frames carry
 * `allow="picture-in-picture"` for exactly that.
 *
 * An iframe reloads when it moves to another document, so the window gets a
 * fresh player: the live stream joins at the live edge anyway, a recording is
 * started where the page left it (`start=`).
 */

interface DocumentPiP {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>
  window: Window | null
}

function api(): DocumentPiP | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { documentPictureInPicture?: DocumentPiP }).documentPictureInPicture ?? null
}

/** Whether this browser can open the window at all */
export function pipSupported(): boolean {
  return api() !== null
}

/**
 * Open `src` in the always-on-top window, replacing whatever was in it.
 * `onClose` runs when the viewer closes the window (or it is replaced).
 */
export async function openPip(src: string, title: string, onClose?: () => void): Promise<boolean> {
  const dpip = api()
  if (!dpip) return false
  try {
    dpip.window?.close()
    const win = await dpip.requestWindow({ width: 480, height: 270 })
    const doc = win.document
    doc.title = title
    const style = doc.createElement('style')
    style.textContent = 'html,body{margin:0;height:100%;background:#000;overflow:hidden}iframe{display:block;border:0;width:100%;height:100%}'
    doc.head.append(style)
    const frame = doc.createElement('iframe')
    frame.src = src
    frame.title = title
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
    frame.allowFullscreen = true
    frame.referrerPolicy = 'strict-origin-when-cross-origin'
    doc.body.append(frame)
    if (onClose) win.addEventListener('pagehide', onClose, { once: true })
    return true
  } catch (error) {
    // Refused (no user gesture, blocked by the browser): nothing opened.
    console.warn('[pip] window refused:', error instanceof Error ? `${error.name}: ${error.message}` : error)
    return false
  }
}
