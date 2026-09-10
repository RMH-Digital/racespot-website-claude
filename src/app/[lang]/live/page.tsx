import type { Metadata } from 'next'
import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents } from '@/lib/sheets'
import { LiveEmbed } from '@/components/sections/LiveEmbed'
import { LiveOffline } from '@/components/sections/LiveOffline'

/* Always fetch fresh data — live detection must be real-time */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Live',
  description: 'Watch Racespot live streams — sim racing broadcasts live on YouTube.',
  openGraph: {
    title: 'Live | Racespot.tv',
    description: 'Watch Racespot live streams — sim racing broadcasts live on YouTube.',
    images: [{ url: '/og-live.jpg', width: 1200, height: 630, alt: 'Racespot live broadcast' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-live.jpg'] },
}

export default async function LivePage() {
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
    return <LiveEmbed liveStreams={liveStreams} upcomingEvents={upcomingEvents} />
  }

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null

  return (
    <LiveOffline
      nextEvent={nextEvent}
      upcomingEvents={upcomingEvents}
      channelId={channelId}
    />
  )
}
