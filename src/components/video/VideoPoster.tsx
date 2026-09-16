'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getT, type Lang } from '@/lib/i18n'
import { useVideoPlayer } from './VideoPlayerProvider'

/**
 * A video's still with a play button, standing in for an embedded frame.
 *
 * Nothing of YouTube's loads until the reader presses play — then the site's
 * player opens the same recording. The still comes from i.ytimg.com, which
 * next/image already trusts for thumbnails.
 *
 * Not every video has every size: `maxresdefault` exists only for uploads
 * that were HD when YouTube made the stills, and a 404 there leaves a blank
 * box. So the poster asks for the largest and steps down on error —
 * `sddefault` (640×480, always there for anything but the oldest uploads),
 * then `hqdefault`, which every video has.
 */
const SIZES = ['maxresdefault', 'sddefault', 'hqdefault'] as const
export function VideoPoster({ lang, id, title, className = '' }: { lang: Lang; id: string; title: string; className?: string }) {
  const t = getT(lang)
  const { play } = useVideoPlayer()
  const [size, setSize] = useState(0)
  return (
    <button
      type="button"
      onClick={() => play({ kind: 'video', id, title })}
      aria-label={`${t('video.play')}: ${title}`}
      className={`group relative block aspect-video w-full overflow-hidden rounded-rs border border-white/10 bg-rs-gray text-left ${className}`}
    >
      <Image
        key={SIZES[size]}
        src={`https://i.ytimg.com/vi/${id}/${SIZES[size]}.jpg`}
        alt=""
        fill
        sizes="(max-width: 1200px) 100vw, 1200px"
        // 4:3 stills carry black bars; object-cover in a 16:9 box crops them away.
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        onError={() => setSize((n) => Math.min(n + 1, SIZES.length - 1))}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rs-yellow text-rs-black shadow-lg transition-transform group-hover:scale-105 md:h-20 md:w-20">
          <span className="ml-1 text-2xl md:text-3xl" aria-hidden="true">▶</span>
        </span>
      </div>
      <span className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white md:text-base">{title}</span>
    </button>
  )
}
