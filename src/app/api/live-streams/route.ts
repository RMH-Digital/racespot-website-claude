import { getLiveStreams, getLiveStreamsViaSearch } from '@/lib/youtube'
import { getUpcomingEvents } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

/**
 * GET /api/live-streams
 * Returns current live streams for client-side polling.
 * The /live page polls this every 30 seconds to detect new/ended streams.
 *
 * Detection chain:
 *   1. RSS + videos.list (1 unit), then a free scrape of the channel page
 *   2. Only if the Master Schedule says a broadcast is on: the Search API
 *      (100 units), for the case where the stream is too new to be in the
 *      uploads list. What that may cost is decided in youtube.ts — see
 *      MAX_SEARCHES_PER_BROADCAST.
 *
 * The schedule is read first, because it decides whether the expensive tier
 * is allowed to run at all.
 */
export async function GET() {
  try {
    const events = await getUpcomingEvents(3)
    // The row the schedule says is on air. Its id keys the search budget, so
    // one broadcast cannot spend more than its share however long it runs.
    const onAir = events.find((e) => e.isLive)
    const scheduled = onAir ? { key: onAir.id } : undefined
    const liveStreams = await getLiveStreams(scheduled)

    const headers = {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    }

    // Primary detection found streams — return them
    if (liveStreams.length > 0) {
      return Response.json({ streams: liveStreams }, { headers })
    }

    // Nothing found, but the schedule says a broadcast is on and started
    // less than half an hour ago — the window in which a brand-new stream may
    // not be in the upload list yet. Later, "not found" means "not on air":
    // streams end early far more often than they start late.
    if (onAir && Date.now() - onAir.date.getTime() < 30 * 60 * 1000) {
      const searchResults = await getLiveStreamsViaSearch(scheduled)
      return Response.json({ streams: searchResults }, { headers })
    }

    return Response.json({ streams: [] }, { headers })
  } catch (error) {
    console.error('Live streams API error:', error)
    return Response.json({ streams: [] })
  }
}
