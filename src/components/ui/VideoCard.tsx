'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatViewCount, formatDate, type YouTubeVideo } from '@/lib/youtube-utils'
import { getT, type Lang } from '@/lib/i18n'

interface VideoCardProps {
  lang: Lang
  video: YouTubeVideo
}

export function VideoCard({ lang, video }: VideoCardProps) {
  const t = getT(lang)
  const isLive = video.liveBroadcastContent === 'live'
  const isUpcoming = video.liveBroadcastContent === 'upcoming'

  // Defer date formatting to avoid hydration mismatch (server UTC vs client TZ)
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    setDateStr(formatDate(video.publishedAt, lang))
  }, [video.publishedAt, lang])

  return (
    <a
      href={`https://youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card-dark overflow-hidden group cursor-pointer block"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-rs-gray">
        <Image
          src={video.thumbnailHigh || video.thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-rs-yellow flex items-center justify-center shadow-lg">
            <span className="text-rs-black text-lg ml-0.5">▶</span>
          </div>
        </div>

        {/* Badges */}
        {isLive && (
          <span className="absolute top-2.5 left-2.5 badge-live">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
            {t('video.live')}
          </span>
        )}
        {isUpcoming && (
          <span className="absolute top-2.5 left-2.5 badge-upcoming">{t('video.upcoming')}</span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-white leading-snug mb-2 group-hover:text-rs-yellow transition-colors line-clamp-2">
          {video.title}
        </h3>
        <p className="text-xs text-rs-muted">
          {formatViewCount(video.viewCount)} {t('common.views')}{dateStr ? ` · ${dateStr}` : ''}
        </p>
      </div>
    </a>
  )
}
