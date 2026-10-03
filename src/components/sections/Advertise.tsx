import Link from 'next/link'
import { LOCALES, getT, localePath, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { getSiteStats, roundedDown } from '@/lib/stats'
import { PACKAGES } from '@/lib/packages'

/**
 * "Advertise with Racespot" on the services page — the way in for brands.
 *
 * Measured figures only, each dropped when its source has nothing (no
 * fallback for watch time and the live average from Racespot Analytics: an
 * old figure under these labels would be a claim we cannot show). The packages by name and one
 * line each, every card preselecting itself on the media form. No prices:
 * those are in the media kit, sent on request (Jürgen, 2026-10-03).
 */
const COLS: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }

export async function Advertise({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const locale = LOCALES[lang]
  const stats = await getSiteStats()
  const contact = (pkg?: string) => `${localePath(lang, '/contact')}?type=media${pkg ? `&package=${pkg}` : ''}`

  const figures: { value: string; label: string }[] = [
    { value: roundedDown(stats.broadcasts, locale, 10), label: t('ads.stat.streams') },
    // Watch time rounds down to thousands; the average is an average, so it
    // rounds to the nearest minute (654 s → Ø 11), as the media kit does.
    ...(stats.watchHours !== null
      ? [{ value: roundedDown(stats.watchHours, locale, 1000), label: t('ads.stat.watchHours') }]
      : []),
    ...(stats.liveAvgViewMinutes !== null
      ? [{ value: `Ø ${Math.round(stats.liveAvgViewMinutes).toLocaleString(locale)}`, label: t('ads.stat.avgView') }]
      : []),
    { value: roundedDown(stats.youtubeSubscribers, locale, 100), label: t('ads.stat.subscribers') },
  ]

  return (
    <section className="mt-20" aria-labelledby="advertise-title">
      <p className="section-label mb-3">{t('ads.label')}</p>
      <h2 id="advertise-title" className="font-display font-bold text-2xl uppercase text-white mb-4">{t('ads.title')}</h2>
      <p className="text-rs-muted max-w-2xl mb-10">{t('ads.intro')}</p>

      {/* As many columns as figures (two to four), and on a phone an odd last
          one spans the row — an empty cell would show as a grey block. */}
      <ul className={`grid grid-cols-2 ${COLS[figures.length] ?? 'md:grid-cols-4'} gap-px bg-rs-border border border-rs-border rounded-rs overflow-hidden mb-12 max-md:[&>li:last-child:nth-child(odd)]:col-span-2`}>
        {figures.map((f) => (
          <li key={f.label} className="bg-rs-dark px-5 py-6 md:px-6 md:py-7">
            <p className="font-display font-black text-rs-yellow text-2xl md:text-3xl leading-none tabular-nums">{f.value}</p>
            <p className="text-xs text-rs-muted mt-2 leading-snug">{f.label}</p>
          </li>
        ))}
      </ul>

      <h3 className="text-[11px] font-display font-bold uppercase tracking-widest text-rs-muted mb-4">{t('ads.packages')}</h3>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PACKAGES.map((p) => (
          <li key={p}>
            <Link
              href={contact(p)}
              data-track={`ads-package-${p}`}
              className="group flex h-full items-start justify-between gap-4 rounded-rs border border-rs-border bg-rs-dark p-5 transition-colors hover:border-rs-yellow"
            >
              <span>
                <span className="block font-display font-bold uppercase text-white group-hover:text-rs-yellow transition-colors">
                  {t(`pkg.${p}.name` as TranslationKey)}
                </span>
                <span className="block text-sm text-rs-muted mt-1">{t(`pkg.${p}.tagline` as TranslationKey)}</span>
              </span>
              <span aria-hidden="true" className="text-rs-muted group-hover:text-rs-yellow transition-colors">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-rs-muted">{t('ads.pricesNote')}</p>
        <Link href={contact()} data-track="ads-cta" className="btn-primary">{t('ads.cta')}</Link>
      </div>
    </section>
  )
}
