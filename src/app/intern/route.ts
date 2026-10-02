import { NextResponse, type NextRequest } from 'next/server'

/**
 * Hidden door for the Racespot team (see components/seo/SecretDoor.tsx):
 * forwards to the sign-in on analytics.racespot.tv, which unlocks the
 * feedback button on this device and sends the visitor back to `back`.
 *
 * Not in the sitemap, `noindex`, and deliberately NOT in robots.txt — a
 * Disallow line would advertise the address. Passwords are never typed on
 * this site; they go to the hub only.
 */
const HUB = process.env.NEXT_PUBLIC_FEEDBACK_HUB || 'https://analytics.racespot.tv'

export function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('back') ?? ''
  const back = /^\/(?![/\\])[^\s\\#]{0,300}$/.test(raw) ? raw : '/'
  const params = new URLSearchParams({ project: 'website', back })
  // In development the hub needs to know where to send the proof back to;
  // in production it uses its first registered origin (https://racespot.tv).
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('localhost:')) params.set('origin', `http://${host}`)
  const response = NextResponse.redirect(`${HUB}/feedback/freischalten?${params}`, 302)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Cache-Control', 'no-store')
  return response
}
