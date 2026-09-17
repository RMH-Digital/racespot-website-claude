import Link from 'next/link'
import { getCompletedBroadcasts, getChannelPlaylists } from '@/lib/youtube'
import { PlaylistCard } from '@/components/ui/PlaylistCard'
import { VideoCard } from '@/components/ui/VideoCard'
import { getT, localePath, type Lang } from '@/lib/i18n'
import { LiveBanners } from './LiveBanners'
import { ChannelCard } from './ChannelCard'

export async function LatestBroadcasts({ lang }: { lang: Lang }) {
  const t = getT(lang)
  // Two recordings; the third cell is the channel they come from. When the
  // upload list cannot be read, the two newest series playlists stand in —
  // a library card is better than a placeholder, and far better than a notice.
  const videos = await getCompletedBroadcasts(2)
  const playlists = videos.length > 0
    ? []
    : (await getChannelPlaylists(50))
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
        .slice(0, 2)

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

        {/* Two latest recordings (or playlists), and the channel as the third tile */}
        <div className="card-grid card-grid--3">
          {videos.map((video) => (
            <VideoCard key={video.id} lang={lang} video={video} />
          ))}
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} lang={lang} playlist={playlist} />
          ))}
          <ChannelCard lang={lang} />
        </div>
      </div>
    </section>
  )
}
