import Link from 'next/link'
import { headers } from 'next/headers'
import { DEFAULT_LANG, LANG_HEADER, isLang, localePath, t } from '@/lib/i18n'

/**
 * not-found.tsx gets no route params, so the language comes from the header
 * the middleware sets on every /{lang}/ request.
 */
export default function NotFound() {
  const fromHeader = headers().get(LANG_HEADER)
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
