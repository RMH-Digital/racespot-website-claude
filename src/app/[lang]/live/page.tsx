import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents, toCalendarEvent, watchedBroadcast } from '@/lib/sheets'
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
  // The schedule first: whether a broadcast is on or about to start decides
  // how often YouTube is asked and whether the hundred-unit search may run
  // at all — see getLiveStreams.
  const events = await getUpcomingEvents(10)
  const liveStreams = await getLiveStreams(watchedBroadcast(events))

  // The next five, as calendar events with their announced YouTube stream
  // attached where there is one — every row offers the same save menu as the
  // calendar, bell included (UpcomingRow).
  const upcomingEvents = await withReplays(events.filter((e) => e.isUpcoming).slice(0, 5).map(toCalendarEvent))

  if (liveStreams.length > 0) {
    return <LiveEmbed lang={lang} liveStreams={liveStreams} upcomingEvents={upcomingEvents} />
  }

  const nextEvent = upcomingEvents[0] ?? null

  return (
    <LiveOffline
      lang={lang}
      nextEvent={nextEvent}
      upcomingEvents={upcomingEvents}
    />
  )
}
