import { getT, LOCALES, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { getSiteStats, roundedDown } from '@/lib/stats'
import { Tip } from '@/components/ui/Tip'

/**
 * The yellow band of numbers. Every figure is measured — broadcasts and hours
 * on air from the Master Schedule over the last 365 days, subscribers from
 * the YouTube API, the other platforms from the team's own analytics,
 * languages stated by the team. Lifetime YouTube views were the second tile
 * until 2026-09-16; hours replaced them because they say what we do rather
 * than how long the channel has existed — hours watched where the Analytics
 * API is authorised, hours on air otherwise. See src/lib/stats.ts for the sourcing and the reason the
 * old "100M+ impressions" tile is gone.
 *
 * Figures are rounded *down*, so what we show is always a number we beat — but
 * in small steps (10 broadcasts, 100 followers) rather than to the nearest
 * round hundred or thousand, so the band visibly moves as the numbers grow
 * instead of sitting on "400+" for a year.
 */
export async function StatsBar({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const stats = await getSiteStats()
  const locale = LOCALES[lang]

  // Every tile explains itself on hover — the sourcing that used to be a
  // line of small print under the numbers, now only for whoever asks.
  const tiles: { value: string; labelKey: TranslationKey; tipKey: TranslationKey }[] = [
    { value: roundedDown(stats.broadcasts, locale, 10), labelKey: 'stats.broadcastsLast12Months', tipKey: 'stats.tip.broadcasts' },
    // Hours watched once the Analytics API is set up (docs/YOUTUBE-ANALYTICS.md);
    // hours on air until then, and again whenever Google does not answer.
    stats.watchHours !== null
      ? { value: roundedDown(stats.watchHours, locale, 100), labelKey: 'stats.hoursWatched', tipKey: 'stats.tip.hoursWatched' }
      : { value: roundedDown(stats.hours, locale, 10), labelKey: 'stats.hoursOnAir', tipKey: 'stats.tip.hoursOnAir' },
    { value: roundedDown(stats.followers, locale, 100), labelKey: 'stats.followers', tipKey: 'stats.tip.followers' },
    { value: String(stats.languages), labelKey: 'stats.languagesCovered', tipKey: 'stats.tip.languages' },
  ]

  return (
    <div className="bg-rs-yellow py-12 border-b border-rs-border">
      <div className="container-rs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {tiles.map((tile) => (
            <Tip key={tile.labelKey} content={t(tile.tipKey)} className="text-center">
              <p className="font-display font-black text-rs-black" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                {tile.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-rs-black/70 mt-1">
                {t(tile.labelKey)}
              </p>
            </Tip>
          ))}
        </div>
      </div>
    </div>
  )
}
