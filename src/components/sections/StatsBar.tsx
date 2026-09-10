import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

const STATS: { value: string; labelKey: TranslationKey }[] = [
  { value: '400+', labelKey: 'stats.broadcastsPerYear' },
  { value: '100M+', labelKey: 'stats.impressionsPerYear' },
  { value: '6.2M+', labelKey: 'stats.youtubeViews' },
  { value: '8', labelKey: 'stats.languagesCovered' },
]

export function StatsBar({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <div className="bg-rs-yellow py-12 border-b border-rs-border">
      <div className="container-rs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <p className="font-display font-black text-rs-black" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                {stat.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rs-black/70 mt-1">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
