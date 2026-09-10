import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents } from '@/lib/sheets'
import { LiveEmbed } from '@/components/sections/LiveEmbed'
import { LiveOffline } from '@/components/sections/LiveOffline'
import type { Lang } from '@/lib/i18n'

/* Always fetch fresh data — live detection must be real-time */
export const dynamic = 'force-dynamic'

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return staticPageMetadata(lang, '/live', 'live', '/og-live.jpg')
}

export default async function LivePage({ params: { lang } }: { params: { lang: Lang } }) {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || ''

  const [liveStreams, events] = await Promise.all([
    getLiveStreams(),
    getUpcomingEvents(10),
  ])

  // Check if Google Sheets shows any live events
  const liveEvents = events.filter((e) => e.isLive)

  // Build upcoming events list (used in both live and offline states)
  const upcomingEvents = events
    .filter((e) => e.isUpcoming)
    .slice(0, 5)
    .map((e) => ({
      series: e.series,
      description: e.description,
      dateISO: e.date.toISOString(),
      tier: e.tier,
    }))

  // Primary detection (RSS+videos.list → scraping) found streams
  if (liveStreams.length > 0) {
    return <LiveEmbed lang={lang} liveStreams={liveStreams} upcomingEvents={upcomingEvents} />
  }

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null

  return (
    <LiveOffline
      lang={lang}
      nextEvent={nextEvent}
      upcomingEvents={upcomingEvents}
      channelId={channelId}
    />
  )
}
