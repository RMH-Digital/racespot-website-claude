import { type NextRequest } from 'next/server'

/**
 * The page inside the always-on-top window (components/video/pip.ts): one YouTube player,
 * nothing else.
 *
 * The window itself is a blank document with no address, and a player built
 * straight into it sends YouTube no Referer — YouTube answers that with
 * "Error 153, video player configuration" (seen 2026-10-28, live and
 * recordings alike). Loaded from here, the player is embedded by a racespot.tv
 * page like everywhere else on the site.
 *
 * Only youtube-nocookie embeds are accepted, so this is no open frame for
 * other sites. Not in the sitemap, noindex.
 */
const EMBED = /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+(\?[\w\-.~%&=,]*)?$/

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src') ?? ''
  const title = (request.nextUrl.searchParams.get('title') ?? 'Racespot').slice(0, 200)
  if (!EMBED.test(src)) return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } })
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escape(title)}</title>
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}iframe{display:block;border:0;width:100%;height:100%}</style></head>
<body><iframe src="${escape(src)}" title="${escape(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></body></html>`
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=3600' },
  })
}
