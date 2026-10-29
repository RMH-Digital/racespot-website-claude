import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents, watchedBroadcast } from '@/lib/sheets'
import { liveRows } from '@/lib/liveRows'
import { timingRooms, seriesHasTiming } from '@/lib/timing/rooms'
import { liveRooms, timingLog } from '@/lib/timing/relay'
import { overlap } from '@/lib/titleMatch'
import { matchLiveRooms } from '@/lib/timing/liveMatch'
import type { YouTubeLiveStream } from '@/lib/youtube-utils'
import type { ScheduleEvent } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

/**
 * GET /api/live-streams — what is on air right now, for the tabs that poll it:
 * the streams, which schedule row each one is (`rows`, row id → stream id),
 * and the Live Timing room of each of those rows that has one (`timing`,
 * row id → room name, e.g. "Racespot2").
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
    const rows = liveRows(events, streams)
    return Response.json(
      { streams, rows, timing: await liveTiming(events, rows, streams) },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } },
    )
  } catch (error) {
    console.error('Live streams API error:', error)
    return Response.json({ streams: [], rows: {}, timing: {} })
  }
}

/**
 * The Live Timing room of every row on air, where there is a timing to see.
 *
 * First choice is one of our rooms ATVO is broadcasting to right now whose
 * event name, as the crew set it at Appgineering, names this broadcast —
 * "iRacing Short Course | 2026 Pro 2 National Series | Round 5 at Lucas Oil"
 * for the schedule's "iRacing Short Course Pro 4 National Series". That is
 * the room the timing actually runs in. Without it the room comes from the
 * talent dashboard, or is worked out from the schedule (lib/timing/rooms.ts);
 * on 2026-10-29 that worked-out room was Racespot1 while the race ran in
 * Racespot2, and nobody got a tab. A room is listed as live only while ATVO
 * broadcasts to it, so a broadcast from another sim simply has none. Only if
 * that list cannot be read does the series name decide.
 */
async function liveTiming(events: ScheduleEvent[], rows: Record<string, string>, streams: YouTubeLiveStream[]): Promise<Record<string, string>> {
  const onAir = events.filter((e) => rows[e.id])
  if (onAir.length === 0) return {}
  const [rooms, live] = await Promise.all([timingRooms(onAir), liveRooms()])
  const titles = new Map(streams.map((s) => [s.id, s.title]))
  const byEvent = live
    ? matchLiveRooms(onAir.map((e) => ({ id: e.id, series: e.series, streamTitle: titles.get(rows[e.id]) })), live, overlap)
    : { rooms: new Map<string, string>(), ambiguous: [] as string[] }
  const out: Record<string, string> = {}
  for (const e of onAir) {
    const matched = byEvent.rooms.get(e.id)
    const room = matched ?? rooms.get(e.id)?.name
    if (!room) continue
    const has = live ? live.has(room.toLowerCase()) : seriesHasTiming(e.series)
    if (has) out[e.id] = room
    noteDecision(e, room, has, live, matched ? 'event' : byEvent.ambiguous.includes(e.id) ? 'ambiguous' : null)
  }
  return out
}

/**
 * One log line per broadcast whenever its answer changes — enough to tell
 * afterwards whether a tab was shown, and if not, whether ATVO was sending
 * to a different room (the live list's own rooms are named).
 */
const decisions = new Map<string, string>()

function noteDecision(e: ScheduleEvent, room: string, has: boolean, live: Map<string, string | null> | null, how: 'event' | 'ambiguous' | null) {
  const by = how === 'event' ? `, by its event "${live?.get(room.toLowerCase())}"` : how === 'ambiguous' ? ', several live rooms fit its name equally — none taken by event' : ''
  const why = live
    ? (has ? 'live at Appgineering' : `not live at Appgineering (live: ${[...live.keys()].join(', ') || 'none'})`) + by
    : `live list unreadable, by series: ${has ? 'yes' : 'no'}`
  // Keyed without the list itself: other people's rooms come and go all night.
  const key = `${room}|${has}|${live ? 'list' : 'series'}|${how}`
  if (decisions.get(e.id) === key) return
  if (decisions.size > 200) decisions.clear()
  decisions.set(e.id, key)
  timingLog(`${e.series} (${e.date.toISOString().slice(0, 16)}Z): ${room} → ${has ? 'tab shown' : 'no tab'}, ${why}`)
}
