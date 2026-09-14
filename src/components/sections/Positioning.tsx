import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'

/**
 * Editorial breather between the stats band and the first card grid.
 *
 * The home page was a run of tiles with nothing written in our own voice. This
 * is the one place that says who we are in full sentences — it serves viewers
 * and prospective clients equally, which is why it sits high on the page.
 *
 * Copy lives in translations.ts under `home.positioning.*` and is a draft.
 */
export function Positioning({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="section--alt py-20 md:py-28">
      <div className="container-rs">
        <div className="max-w-[900px]">
          <p className="section-label mb-5">{t('home.positioning.label')}</p>

          <h2 className="font-display font-bold uppercase text-white leading-[1.1] text-[26px] md:text-[38px] lg:text-[44px] mb-8">
            {t('home.positioning.title')}
          </h2>

          {/* Yellow rule as the visual anchor — the same device the h2 blocks
              in articles use, so the page stays recognisable. */}
          <div className="h-[3px] w-20 bg-rs-yellow mb-8" />

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <p className="text-[15px] md:text-[16px] text-white/75 leading-relaxed">
              {t('home.positioning.p1')}
            </p>
            <p className="text-[15px] md:text-[16px] text-rs-muted leading-relaxed">
              {t('home.positioning.p2')}
            </p>
          </div>

          <Link href={localePath(lang, '/about')} className="btn-ghost mt-9">
            {t('home.positioning.cta')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
