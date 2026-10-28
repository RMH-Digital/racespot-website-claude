'use client'

import { useState } from 'react'
import { getT, type Lang } from '@/lib/i18n'
import type { Article } from '@/lib/articles'
import { VideoPoster } from './VideoPoster'
import { StreamTabs } from './StreamTabs'

/**
 * The recording an article is about, in the site's one player.
 *
 * A broadcast that went out in several streams — VCO Infinity's 24 hours in
 * four, a summit over two days — gets the tab row the live page shows for two
 * streams at once (Jürgen, 2026-10-28). Each tab plays from its own part, and
 * the parts after it follow in the same frame. Nothing of YouTube loads
 * before play; the still is the chosen part's own.
 */
export function ArticleBroadcast({ lang, broadcast, priority = false }: { lang: Lang; broadcast: NonNullable<Article['broadcast']>; /** At the top of the page: load the still eagerly */ priority?: boolean }) {
  const t = getT(lang)
  const parts = broadcast.videoParts && broadcast.videoParts.length > 1 ? broadcast.videoParts : [broadcast.videoId]
  const [active, setActive] = useState(0)
  const title = broadcast.title ? `${broadcast.series} – ${broadcast.title}` : broadcast.series
  const label = (i: number) => t('video.part').replace('{n}', String(i + 1))

  return (
    <div>
      {parts.length > 1 && (
        <StreamTabs
          fit
          tabs={parts.map((id, i) => ({ id, label: label(i) }))}
          activeId={parts[active]}
          onSelect={(id) => setActive(parts.indexOf(id))}
        />
      )}
      <VideoPoster
        key={parts[active]}
        lang={lang}
        id={parts[active]}
        parts={parts.slice(active)}
        title={parts.length > 1 ? `${title} · ${label(active)}` : title}
        priority={priority}
        attached={parts.length > 1}
      />
    </div>
  )
}
