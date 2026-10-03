import type { ScheduleEvent } from './sheets'
import type { YouTubeLiveStream } from './youtube-utils'
import { overlap, sharesAWord } from './titleMatch'

/**
 * Which schedule row each live stream belongs to.
 *
 * Until 2026-10-03 "live" in the calendar was one switch for the whole
 * channel: while any stream ran, every row inside its window showed LIVE —
 * a class that had finished early beside the one actually on air, two
 * overlapping broadcasts both lit by one stream — and a second broadcast
 * running at the same time vanished from the ticker. Now each stream is
 * paired with the row it is, and only that row is live.
 *
 * Done here, on the server, once per live check: the pairing has to see
 * every row in the window at once to settle who gets which stream, and the
 * calendar, the ticker and the live page's schedule each only hold their own
 * slice. /api/live-streams sends the result with the streams.
 *
 * Two passes:
 *   1. Every row in its window against every stream, best pairing first —
 *      the most words shared between series name and stream title, then the
 *      nearer start (the same rule withReplays uses for recordings). Without
 *      a shared word, the clock alone may pair them only within the hour.
 *   2. A stream that carries on into the next row of the same series — one
 *      stream for two back-to-back classes — lights that row as well, when
 *      it was already running at the row's start.
 */
const EARLY_MS = 30 * 60_000           // a stream may go on air before the scheduled start
const OVERTIME_MS = 90 * 60_000        // same buffer as the schedule's own isLive
const CLOSE_ENOUGH_MS = 60 * 60_000    // clock alone, no shared word
const LATE_START_GRACE_MS = 15 * 60_000

/**
 * A row that goes out somewhere other than our channel. The destination
 * column is empty on old rows and "RaceSpot's YT" on most new ones;
 * "iRacing YT" is somebody else's stream, and our live list can never show it.
 */
export function offChannel(destination: string): boolean {
  const d = destination.trim()
  return d !== '' && !/racespot|\brs\b/i.test(d)
}

export function liveRows(events: ScheduleEvent[], streams: YouTubeLiveStream[], now = Date.now()): Record<string, string> {
  const out: Record<string, string> = {}
  if (streams.length === 0) return out
  const rows = events.filter((e) => {
    const start = e.date.getTime()
    return e.isPublic && !offChannel(e.destination) && now >= start - EARLY_MS && now <= e.endDate.getTime() + OVERTIME_MS
  })
  if (rows.length === 0) return out

  const startOf = (s: YouTubeLiveStream) => {
    const t = Date.parse(s.startedAt ?? '')
    return Number.isFinite(t) ? t : now
  }

  // Pass one
  const pairs: { row: ScheduleEvent; s: YouTubeLiveStream; score: number; delta: number }[] = []
  for (const row of rows) {
    const start = row.date.getTime()
    const end = row.endDate.getTime()
    for (const s of streams) {
      const t = startOf(s)
      const delta = Math.abs(t - start)
      const inSpan = t >= start - EARLY_MS && t <= end + OVERTIME_MS
      const words = sharesAWord(row.series, s.title)
      if (!(inSpan && words) && delta > CLOSE_ENOUGH_MS) continue
      pairs.push({ row, s, score: overlap(row.series, s.title), delta })
    }
  }
  pairs.sort((a, b) => (b.score - a.score) || (a.delta - b.delta))
  const used = new Set<string>()
  for (const p of pairs) {
    if (out[p.row.id] || used.has(p.s.id)) continue
    out[p.row.id] = p.s.id
    used.add(p.s.id)
  }

  // Pass two
  for (const row of rows) {
    const start = row.date.getTime()
    if (out[row.id] || now < start) continue
    const carrying = streams.find((s) => startOf(s) <= start + LATE_START_GRACE_MS && sharesAWord(row.series, s.title))
    if (carrying) out[row.id] = carrying.id
  }
  return out
}
