'use client'

import Image from 'next/image'
import type { YouTubePlaylist } from '@/lib/youtube-utils'
import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { useVideoPlayer } from '@/components/video/VideoPlayerProvider'

/** "1 video" / "12 videos" in the page's language — the count sits in the string where the grammar wants it. */
export function count(t: (k: TranslationKey) => string, n: number, one: TranslationKey, many: TranslationKey): string {
  return (n === 1 ? t(one) : t(many)).replace('{n}', String(n))
}

/**
 * A series playlist as a card. Opens the whole playlist in the site's player.
 * Shared by the broadcasts page and — when there are no recent recordings to
 * show — the home page, which falls back to playlists rather than a notice.
 */
export function PlaylistCard({ playlist, lang }: { playlist: YouTubePlaylist; lang: Lang }) {
  const t = getT(lang)
  const { play } = useVideoPlayer()
  return (
    <button
      type="button"
      onClick={() => play({ kind: 'playlist', id: playlist.id, title: playlist.title })}
      className="card-dark overflow-hidden group cursor-pointer block w-full text-left"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-rs-gray">
        {playlist.thumbnailHigh || playlist.thumbnail ? (
          <Image
            src={playlist.thumbnailHigh || playlist.thumbnail}
            alt={playlist.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl text-rs-muted">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Video count badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm">
          {count(t, playlist.itemCount, 'common.videoOne', 'common.videoMany')}
        </span>

        {/* Playlist icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-rs-yellow flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-rs-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4zm14-1v6l5-3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-white leading-snug mb-1.5 group-hover:text-rs-yellow transition-colors line-clamp-2">
          {playlist.title}
        </h3>
        {playlist.description && (
          <p className="text-xs text-rs-muted line-clamp-2">
            {playlist.description}
          </p>
        )}
      </div>
    </button>
  )
}
