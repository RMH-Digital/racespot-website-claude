'use client'

import { useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { DEFAULT_LANG, isLang, localePath, t, type Lang } from '@/lib/i18n'

/**
 * The body of the 404 page, in the reader's language, without making the page
 * dynamic.
 *
 * The language is the first path segment. Reading it in the browser rather
 * than from a request header is what lets `not-found.tsx` stay static — and
 * that matters far beyond this page, because a dynamic API in a `not-found`
 * file opts its whole segment out of static rendering, which here meant the
 * entire site.
 *
 * `useSyncExternalStore` rather than an effect: the server snapshot is the
 * default language, the client snapshot is the real one, and React resolves
 * the difference during hydration instead of reporting a mismatch. English is
 * what a crawler sees, which is fine for a page that is `noindex` anyway.
 */
function useLangFromPath(): Lang {
  const subscribe = useCallback(() => () => {}, [])
  const fromPath = useCallback(() => {
    const first = window.location.pathname.split('/')[1]
    return isLang(first) ? first : DEFAULT_LANG
  }, [])
  return useSyncExternalStore(subscribe, fromPath, () => DEFAULT_LANG)
}

export function NotFoundBody() {
  const lang = useLangFromPath()

  return (
    <div className="container-rs py-24 text-center">
      <p className="section-label mb-3">404</p>
      <h1 className="display-title mb-6">{t(lang, 'notFound.title')}</h1>
      <p className="text-rs-muted max-w-md mx-auto mb-10">{t(lang, 'notFound.desc')}</p>
      <Link href={localePath(lang, '/')} className="btn-primary">
        {t(lang, 'notFound.home')}
      </Link>
    </div>
  )
}
