import { pastBroadcasts } from '@/lib/broadcasts'

export const revalidate = 300

const DAY = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86_400_000
/** As far back as the calendar and the replay index reach (CALENDAR_PAST_DAYS, REPLAY_DAYS) */
const MAX_SPAN_DAYS = 365

/**
 * GET /api/broadcasts?from=YYYY-MM-DD&to=YYYY-MM-DD — our past broadcasts
 * with a recording, newest first (see lib/broadcasts.ts). Both days are UTC
 * and inclusive; without them, the last 30 days.
 *
 * Read-only and public: nothing here that the calendar page does not already
 * show. Answered from the calendar's memos, cached five minutes.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const today = new Date().toISOString().slice(0, 10)
  const to = params.get('to') ?? today
  const from = params.get('from') ?? new Date(Date.parse(to) - 30 * DAY_MS).toISOString().slice(0, 10)

  if (!DAY.test(from) || !DAY.test(to) || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
    return Response.json({ error: 'from and to must be YYYY-MM-DD' }, { status: 400 })
  }
  const start = Date.parse(from)
  const end = Date.parse(to) + DAY_MS
  if (end <= start) return Response.json({ error: 'to is before from' }, { status: 400 })
  if (end - start > (MAX_SPAN_DAYS + 1) * DAY_MS) {
    return Response.json({ error: `at most ${MAX_SPAN_DAYS} days at a time` }, { status: 400 })
  }

  try {
    const broadcasts = (await pastBroadcasts()).filter((b) => {
      const t = Date.parse(b.dateISO)
      return t >= start && t < end
    })
    return Response.json(
      { from, to, broadcasts },
      { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } },
    )
  } catch {
    return Response.json({ error: 'schedule unavailable' }, { status: 503 })
  }
}
