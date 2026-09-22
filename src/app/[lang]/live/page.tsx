import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents, toCalendarEvent } from '@/lib/sheets'
import { withReplays } from '@/lib/replays'
import { LiveEmbed } from '@/components/sections/LiveEmbed'
import { LiveOffline } from '@/components/sections/LiveOffline'
import type { Lang } from '@/lib/i18n'

/* Always fetch fresh data — live detection must be real-time */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return staticPageMetadata(lang, '/live', 'live', '/og-live.jpg')
}

export default async function LivePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  // The schedule first: whether a broadcast is on decides whether the
  // hundred-unit search may run at all — see getLiveStreamsViaSearch.
  const events = await getUpcomingEvents(10)
  const liveEvents = events.filter((e) => e.isLive)
  const liveStreams = await getLiveStreams(liveEvents[0] ? { key: liveEvents[0].id } : undefined)

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

  // The next broadcast may already be announced on YouTube — then the offline
  // page can offer the bell there, next to the calendar.
  const nextUpcoming = events.find((e) => e.isUpcoming)
  const [withVideo] = nextUpcoming ? await withReplays([toCalendarEvent(nextUpcoming)]) : []
  const nextEvent = upcomingEvents.length > 0 ? { ...upcomingEvents[0], youtubeId: withVideo?.videoId } : null

  return (
    <LiveOffline
      lang={lang}
      nextEvent={nextEvent}
      upcomingEvents={upcomingEvents}
    />
  )
}
