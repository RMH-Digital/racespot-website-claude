import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents, watchedBroadcast } from '@/lib/sheets'
import { liveRows } from '@/lib/liveRows'

export const dynamic = 'force-dynamic'

/**
 * GET /api/live-streams — what is on air right now, for the tabs that poll it:
 * the streams, and which schedule row each one is (`rows`, row id → stream id).
 *
 * Every open tab asks once a minute (LiveStatusProvider), so this has to be
 * cheap however many there are: the schedule is parsed once a minute for the
 * whole process, and getLiveStreams() asks YouTube once a minute while the
 * schedule has a broadcast on or about to start, once in five while it has
 * not — everything in between is answered from memory. The schedule is read
 * first because it sets that cadence, and because it alone decides whether
 * the hundred-unit search may run at all (see getLiveStreams in youtube.ts).
 */
export async function GET() {
  try {
    // Twenty, not three: every row on air or about to be has to be in it
    // for liveRows() to pair the streams with their rows.
    const events = await getUpcomingEvents(20)
    const streams = await getLiveStreams(watchedBroadcast(events))
    return Response.json(
      { streams, rows: liveRows(events, streams) },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } },
    )
  } catch (error) {
    console.error('Live streams API error:', error)
    return Response.json({ streams: [], rows: {} })
  }
}
