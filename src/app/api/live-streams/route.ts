import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents, watchedBroadcast } from '@/lib/sheets'
import { liveRows } from '@/lib/liveRows'
import { timingRooms, seriesHasTiming } from '@/lib/timing/rooms'
import { liveRooms, timingLog } from '@/lib/timing/relay'
import { overlap } from '@/lib/titleMatch'
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
const OUR_ROOM = /^racespot\d+$/
const EVENT_MATCH = 0.5

async function liveTiming(events: ScheduleEvent[], rows: Record<string, string>, streams: YouTubeLiveStream[]): Promise<Record<string, string>> {
  const onAir = events.filter((e) => rows[e.id])
  if (onAir.length === 0) return {}
  const [rooms, live] = await Promise.all([timingRooms(onAir), liveRooms()])
  const byEvent = live ? matchLiveRooms(onAir, rows, streams, live) : new Map<string, string>()
  const out: Record<string, string> = {}
  for (const e of onAir) {
    const matched = byEvent.get(e.id)
    const room = matched ?? rooms.get(e.id)?.name
    if (!room) continue
    const has = live ? live.has(room.toLowerCase()) : seriesHasTiming(e.series)
    if (has) out[e.id] = room
    noteDecision(e, room, has, live, Boolean(matched))
  }
  return out
}

/**
 * Row id → our live room whose event name names that row (its series or its
 * stream's title), best agreement first, each room to one row only.
 */
function matchLiveRooms(onAir: ScheduleEvent[], rows: Record<string, string>, streams: YouTubeLiveStream[], live: Map<string, string | null>): Map<string, string> {
  const titles = new Map(streams.map((s) => [s.id, s.title]))
  const pairs: { row: string; room: string; score: number }[] = []
  for (const [name, event] of live) {
    if (!OUR_ROOM.test(name) || !event) continue
    for (const e of onAir) {
      const title = titles.get(rows[e.id]) ?? ''
      const score = Math.max(overlap(event, e.series), overlap(e.series, event), title ? overlap(event, title) : 0)
      if (score >= EVENT_MATCH) pairs.push({ row: e.id, room: name, score })
    }
  }
  pairs.sort((a, b) => b.score - a.score)
  const out = new Map<string, string>()
  const taken = new Set<string>()
  for (const p of pairs) {
    if (out.has(p.row) || taken.has(p.room)) continue
    out.set(p.row, `Racespot${p.room.slice('racespot'.length)}`)
    taken.add(p.room)
  }
  return out
}

/**
 * One log line per broadcast whenever its answer changes — enough to tell
 * afterwards whether a tab was shown, and if not, whether ATVO was sending
 * to a different room (the live list's own rooms are named).
 */
const decisions = new Map<string, string>()

function noteDecision(e: ScheduleEvent, room: string, has: boolean, live: Map<string, string | null> | null, byEvent: boolean) {
  const why = live
    ? has ? `live at Appgineering${byEvent ? `, by its event "${live.get(room.toLowerCase())}"` : ''}` : `not live at Appgineering (live: ${[...live.keys()].join(', ') || 'none'})`
    : `live list unreadable, by series: ${has ? 'yes' : 'no'}`
  // Keyed without the list itself: other people's rooms come and go all night.
  const key = `${room}|${has}|${live ? 'list' : 'series'}`
  if (decisions.get(e.id) === key) return
  if (decisions.size > 200) decisions.clear()
  decisions.set(e.id, key)
  timingLog(`${e.series} (${e.date.toISOString().slice(0, 16)}Z): ${room} → ${has ? 'tab shown' : 'no tab'}, ${why}`)
}
