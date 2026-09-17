import { getLiveStreams, getLiveStreamsViaSearch } from '@/lib/youtube'
import { getUpcomingEvents } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

/**
 * GET /api/live-streams
 * Returns current live streams for client-side polling.
 * The /live page polls this every 30 seconds to detect new/ended streams.
 *
 * Detection chain:
 *   1. getLiveStreams() — RSS+videos.list (1 unit), then scraping (0 units), then Search API (100 units)
 *   2. If empty + Sheets says live → try Search API as last resort (handles edge cases
 *      where stream isn't in RSS yet or was just created)
 */
export async function GET() {
  try {
    const [liveStreams, events] = await Promise.all([
      getLiveStreams(),
      getUpcomingEvents(3),
    ])

    const headers = {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    }

    // Primary detection found streams — return them
    if (liveStreams.length > 0) {
      return Response.json({ streams: liveStreams }, { headers })
    }

    // Fallback: Sheets says we should be live but primary detection failed.
    // Only within the first half hour after a scheduled start — that is the
    // window in which a brand-new stream may not be in the upload list yet.
    // Later, "not found" means "not on air" (streams end early far more often
    // than they start late), and a 100-unit search every five minutes for
    // ninety minutes after every broadcast would be quota spent on nothing.
    const recentlyStarted = events.filter((e) => e.isLive && Date.now() - e.date.getTime() < 30 * 60 * 1000)
    if (recentlyStarted.length > 0) {
      console.log('[Live API] Primary detection empty but Sheets shows live event — trying Search API')
      const searchResults = await getLiveStreamsViaSearch()
      return Response.json({ streams: searchResults }, { headers })
    }

    return Response.json({ streams: [] }, { headers })
  } catch (error) {
    console.error('Live streams API error:', error)
    return Response.json({ streams: [] })
  }
}
