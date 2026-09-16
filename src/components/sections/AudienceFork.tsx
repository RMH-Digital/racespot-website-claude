import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'

/**
 * Two audiences, two paths — placed directly under the hero.
 *
 * The home page serves people who want to watch and people who want a season
 * produced, and it used to leave both to work it out from the same grid of
 * tiles. The hero's buttons only address viewers, so this is where organisers
 * and brands get a door of their own.
 *
 * Copy lives in translations.ts under `home.fork.*` and is a draft.
 */
export function AudienceFork({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="border-b border-rs-border">
      <div className="container-rs">
        <div className="grid md:grid-cols-2">
          {/* Viewers */}
          <div className="py-12 md:py-14 md:pr-12 border-b md:border-b-0 md:border-r border-rs-border">
            <p className="section-label mb-3">{t('home.fork.viewers.label')}</p>
            <h2 className="font-display font-bold uppercase text-white text-[20px] md:text-[24px] leading-tight mb-3">
              {t('home.fork.viewers.title')}
            </h2>
            <p className="text-[14px] text-rs-muted leading-relaxed mb-6 max-w-[38ch]">
              {t('home.fork.viewers.desc')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={localePath(lang, '/live')} className="btn-primary btn-sm">
                {t('nav.live')}
              </Link>
              <Link href={localePath(lang, '/calendar')} className="btn-outline btn-sm">
                {t('nav.calendar')}
              </Link>
            </div>
          </div>

          {/* Organisers and brands */}
          <div className="py-12 md:py-14 md:pl-12">
            <p className="section-label mb-3">{t('home.fork.clients.label')}</p>
            <h2 className="font-display font-bold uppercase text-white text-[20px] md:text-[24px] leading-tight mb-3">
              {t('home.fork.clients.title')}
            </h2>
            <p className="text-[14px] text-rs-muted leading-relaxed mb-6 max-w-[38ch]">
              {t('home.fork.clients.desc')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={localePath(lang, '/contact')} className="btn-primary btn-sm">
                {t('nav.getQuote')}
              </Link>
              <Link href={localePath(lang, '/services')} className="btn-outline btn-sm">
                {t('nav.services')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
