import { getLiveStreams } from '@/lib/youtube'
import { getUpcomingEvents, watchedBroadcast } from '@/lib/sheets'
import { liveRows } from '@/lib/liveRows'
import { timingRooms, seriesHasTiming } from '@/lib/timing/rooms'
import { liveRoomNames, timingLog } from '@/lib/timing/relay'
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
      { streams, rows, timing: await liveTiming(events, rows) },
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
 * The room comes from the talent dashboard (lib/timing/rooms.ts). Whether it
 * has a timing comes from Appgineering itself: a room is listed as live only
 * while ATVO broadcasts to it, so a broadcast from another sim simply has
 * none. Only if that list cannot be read does the series name decide.
 */
async function liveTiming(events: ScheduleEvent[], rows: Record<string, string>): Promise<Record<string, string>> {
  const onAir = events.filter((e) => rows[e.id])
  if (onAir.length === 0) return {}
  const [rooms, live] = await Promise.all([timingRooms(onAir), liveRoomNames()])
  const out: Record<string, string> = {}
  for (const e of onAir) {
    const room = rooms.get(e.id)
    if (!room) continue
    const has = live ? live.has(room.name.toLowerCase()) : seriesHasTiming(e.series)
    if (has) out[e.id] = room.name
    noteDecision(e, room.name, has, live)
  }
  return out
}

/**
 * One log line per broadcast whenever its answer changes — enough to tell
 * afterwards whether a tab was shown, and if not, whether ATVO was sending
 * to a different room (the live list's own rooms are named).
 */
const decisions = new Map<string, string>()

function noteDecision(e: ScheduleEvent, room: string, has: boolean, live: Set<string> | null) {
  const why = live
    ? has ? 'live at Appgineering' : `not live at Appgineering (live: ${[...live].join(', ') || 'none'})`
    : `live list unreadable, by series: ${has ? 'yes' : 'no'}`
  // Keyed without the list itself: other people's rooms come and go all night.
  const key = `${room}|${has}|${live ? 'list' : 'series'}`
  if (decisions.get(e.id) === key) return
  if (decisions.size > 200) decisions.clear()
  decisions.set(e.id, key)
  timingLog(`${e.series} (${e.date.toISOString().slice(0, 16)}Z): ${room} → ${has ? 'tab shown' : 'no tab'}, ${why}`)
}
