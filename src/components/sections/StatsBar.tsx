import { getT, LOCALES, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { getSiteStats, roundedDown } from '@/lib/stats'

/**
 * The yellow band of numbers. Every figure is measured — broadcasts and hours
 * from the Master Schedule over the last 365 days, views from the YouTube API,
 * languages stated by the team. See src/lib/stats.ts for the sourcing and the
 * reason the old "100M+ impressions" tile is gone.
 *
 * Figures are rounded *down*, so what we show is always a number we beat.
 */
export async function StatsBar({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const stats = await getSiteStats()
  const locale = LOCALES[lang]

  const tiles: { value: string; labelKey: TranslationKey }[] = [
    { value: roundedDown(stats.broadcasts, locale), labelKey: 'stats.broadcastsPerYear' },
    { value: roundedDown(stats.hours, locale), labelKey: 'stats.broadcastHours' },
    { value: roundedDown(stats.youtubeViews, locale), labelKey: 'stats.youtubeViews' },
    { value: String(stats.languages), labelKey: 'stats.languagesCovered' },
  ]

  return (
    <div className="bg-rs-yellow py-12 border-b border-rs-border">
      <div className="container-rs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {tiles.map((tile) => (
            <div key={tile.labelKey} className="text-center">
              <p className="font-display font-black text-rs-black" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                {tile.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rs-black/70 mt-1">
                {t(tile.labelKey)}
              </p>
            </div>
          ))}
        </div>

        {/* States what the numbers cover, so the claim is precise rather than vague */}
        <p className="text-[10px] text-rs-black/50 text-center mt-8 tracking-wide">
          {t('stats.period')}
        </p>
      </div>
    </div>
  )
}
