'use client'

import Link from 'next/link'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'
import { formatViewCount } from '@/lib/youtube-utils'
import { getT, localePath, type Lang } from '@/lib/i18n'

export function LiveBanners({ lang }: { lang: Lang }) {
  const { liveStreams } = useLiveStatus()
  const t = getT(lang)

  if (liveStreams.length === 0) return null

  return (
    <div className="space-y-3 mb-8">
      {liveStreams.map((stream) => (
        <Link
          key={stream.id}
          href={localePath(lang, '/live')}
          className="flex items-center gap-4 p-4 rounded-rs border border-rs-live/40 bg-rs-dark group hover:border-rs-live transition-colors"
        >
          <span className="badge-live shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
            {t('hero.liveNow')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold truncate group-hover:text-rs-yellow transition-colors">
              {stream.title}
            </p>
            <p className="text-rs-muted text-xs">
              {formatViewCount(stream.concurrentViewers)} {t('live.watching')}
            </p>
          </div>
          <span className="text-rs-yellow text-sm font-display font-bold uppercase tracking-wider shrink-0">
            {t('live.watch')} ▶
          </span>
        </Link>
      ))}
    </div>
  )
}
