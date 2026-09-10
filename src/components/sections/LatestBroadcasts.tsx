import Link from 'next/link'
import { getCompletedBroadcasts } from '@/lib/youtube'
import { VideoCard } from '@/components/ui/VideoCard'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { LiveBanners } from './LiveBanners'

export async function LatestBroadcasts({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const videos = await getCompletedBroadcasts(3)

  const hasData = videos.length > 0

  return (
    <section className="section">
      <div className="container-rs">
        <div className="section-header">
          <div>
            <p className="section-label mb-2">{t('broadcasts.recentCoverage')}</p>
            <h2 className="section-title">{t('broadcasts.latestBroadcasts')}</h2>
          </div>
          <Link href={localePath(lang, '/broadcasts')} className="btn-ghost hidden sm:flex">
            {t('broadcasts.viewAll')}
          </Link>
        </div>

        {/* Live stream banners — client-side, from LiveStatusProvider */}
        <LiveBanners lang={lang} />

        {/* Video grid — 3 latest broadcasts */}
        {hasData ? (
          <div className="card-grid card-grid--3">
            {videos.map((video) => (
              <VideoCard key={video.id} lang={lang} video={video} />
            ))}
          </div>
        ) : (
          <FallbackBroadcasts lang={lang} />
        )}
      </div>
    </section>
  )
}

/** Fallback when YouTube API is unavailable */
function FallbackBroadcasts({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const placeholders = [
    { emoji: '🏎', title: t('broadcasts.fb1.title'), category: t('broadcasts.fb1.category') },
    { emoji: '🏁', title: t('broadcasts.fb2.title'), category: t('broadcasts.fb2.category') },
    { emoji: '🌙', title: t('broadcasts.fb3.title'), category: t('broadcasts.fb3.category') },
  ]

  return (
    <div className="card-grid card-grid--3">
      {placeholders.map((b, i) => (
        <a
          key={i}
          href="https://www.youtube.com/@RaceSpotTV"
          target="_blank"
          rel="noopener noreferrer"
          className="card-dark overflow-hidden group"
        >
          <div className="aspect-video bg-rs-gray flex items-center justify-center">
            <span className="text-4xl">{b.emoji}</span>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rs-yellow mb-1.5">
              {b.category}
            </p>
            <h3 className="text-[15px] font-semibold text-white leading-snug mb-2 group-hover:text-rs-yellow transition-colors">{b.title}</h3>
            <p className="text-xs text-rs-muted">{t('broadcasts.watchOnYT')}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
