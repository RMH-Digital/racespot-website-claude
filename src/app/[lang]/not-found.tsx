import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { DEFAULT_LANG, LANG_HEADER, isLang, localePath, t } from '@/lib/i18n'

/**
 * Without this the 404 inherited the home page's title, so every dead link in
 * a log or a shared screenshot looked like the front page. `not-found.tsx`
 * takes no params, so this cannot be translated — which is fine: the page is
 * noindex, and the heading below is in the reader's language.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * not-found.tsx gets no route params, so the language comes from the header
 * the proxy sets on every /{lang}/ request.
 */
export default async function NotFound() {
  const fromHeader = (await headers()).get(LANG_HEADER)
  const lang = isLang(fromHeader) ? fromHeader : DEFAULT_LANG

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
