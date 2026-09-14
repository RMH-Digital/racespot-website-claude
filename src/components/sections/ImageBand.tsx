import Image from 'next/image'
import { getT, type Lang } from '@/lib/i18n'

/**
 * Full-bleed photograph with a single line over it, between the two card
 * grids (broadcasts and services).
 *
 * Its only job is rhythm: the page ran card grid into card grid, and this
 * breaks that without asking anyone to read a paragraph. The studio shot also
 * puts people on a page that otherwise has none.
 *
 * Copy lives in translations.ts under `home.band.*` and is a draft.
 */
export function ImageBand({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="relative isolate overflow-hidden h-[340px] md:h-[420px] lg:h-[480px]">
      <Image
        src="/images/studio-banner.jpg"
        alt={t('home.band.imageAlt')}
        fill
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark wash so the line stays readable over a bright studio shot —
          heavier from the bottom on mobile, directional on desktop. */}
      <div
        className="absolute inset-0 md:hidden"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.92) 15%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0.35) 100%)' }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.92) 25%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.25) 100%)' }}
      />

      {/* Same yellow hairline the hero uses, so the band belongs to the page */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />

      <div className="container-rs relative h-full flex items-end md:items-center pb-10 md:pb-0">
        <p className="font-display font-bold uppercase text-white leading-[1.15] text-[22px] md:text-[30px] lg:text-[36px] max-w-[18ch] md:max-w-[22ch]">
          {t('home.band.statement')}
        </p>
      </div>
    </section>
  )
}
