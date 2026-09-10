import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  LANG_HEADER,
  isLang,
  negotiateLang,
  splitPath,
} from '@/lib/i18n/langs'

/**
 * Runs before every page request (not for /api, static files, sitemap, robots).
 *
 *  1. www.racespot.tv → racespot.tv, 301.
 *  2. `/`            → `/{lang}`, 302: the cookie if the visitor chose a
 *                      language on the site before, else Accept-Language,
 *                      else English. 302 and `Vary`, because the answer
 *                      depends on the visitor — a 301 would be cached.
 *  3. `/news/x`      → `/en/news/x`, 301: every pre-i18n URL (Google hits,
 *                      Press Tool social posts) keeps working in English.
 *  4. `/de/…`        → served. The language is remembered in a cookie, but
 *                      only when the visitor navigated here from within the
 *                      site (same-origin Referer). A deep link from LinkedIn
 *                      to `/en/news/x` must not overwrite a German visitor's
 *                      choice — decided 2026-09-10.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.host = host.replace(/^www\./, '')
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

  const { pathname } = request.nextUrl
  const { lang } = splitPath(pathname)

  if (lang) {
    const headers = new Headers(request.headers)
    headers.set(LANG_HEADER, lang)
    const response = NextResponse.next({ request: { headers } })

    if (request.cookies.get(LANG_COOKIE)?.value !== lang && cameFromThisSite(request, host)) {
      response.cookies.set(LANG_COOKIE, lang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        secure: request.nextUrl.protocol === 'https:',
      })
    }
    return response
  }

  const url = request.nextUrl.clone()

  if (pathname === '/') {
    const cookie = request.cookies.get(LANG_COOKIE)?.value
    const target = isLang(cookie) ? cookie : negotiateLang(request.headers.get('accept-language'))
    url.pathname = `/${target}`
    const response = NextResponse.redirect(url, 302)
    response.headers.set('Vary', 'Accept-Language, Cookie')
    return response
  }

  url.pathname = `/${DEFAULT_LANG}${pathname}`
  return NextResponse.redirect(url, 301)
}

function cameFromThisSite(request: NextRequest, host: string): boolean {
  const referer = request.headers.get('referer')
  if (!referer) return false
  try {
    const refHost = new URL(referer).host.replace(/^www\./, '')
    return refHost === host.replace(/^www\./, '')
  } catch {
    return false
  }
}

// Every route except API, Next internals, the sitemap/robots and anything
// with a file extension (images, fonts, icons, manifest).
export const config = {
  matcher: ['/((?!api/|_next/|sitemap\\.xml|robots\\.txt|.*\\..*).*)'],
}
