/**
 * Which of our live Appgineering rooms a broadcast on air is running in, by
 * the event name the crew set in the room.
 *
 * The room worked out from the schedule (rooms.ts) can be wrong: on
 * 2026-10-29 it was Racespot1 while the iRacing Short Course race ran in
 * Racespot2, whose event read "iRacing Short Course | 2026 Pro 2 National
 * Series | Round 5 at Lucas Oil". Appgineering's live list carries that name,
 * so a live room whose event names the row wins.
 *
 * Only a clear answer counts (Jürgen, 2026-10-29): a row two rooms fit
 * equally well gets neither and is reported, rather than a guess. No imports
 * — the scorer is passed in — so `node --test` runs it as it is.
 */

export interface OnAirRow {
  id: string
  series: string
  /** The YouTube title of its stream, if known */
  streamTitle?: string
}

export interface LiveMatch {
  /** Row id → room name as Appgineering spells it, e.g. "Racespot2" */
  rooms: Map<string, string>
  /** Row ids several rooms fit equally well — no room taken */
  ambiguous: string[]
}

/** Share of the first string's meaningful words found in the second (titleMatch.overlap) */
export type Scorer = (a: string, b: string) => number

const OUR_ROOM = /^racespot\d+$/i
/** At least half the words agree, in one direction or the other */
export const EVENT_MATCH = 0.5

export function matchLiveRooms(rows: OnAirRow[], live: Map<string, string | null>, score: Scorer): LiveMatch {
  const pairs: { row: string; room: string; score: number }[] = []
  for (const [name, event] of live) {
    if (!OUR_ROOM.test(name) || !event) continue
    for (const r of rows) {
      const s = Math.max(score(event, r.series), score(r.series, event), r.streamTitle ? score(event, r.streamTitle) : 0)
      if (s >= EVENT_MATCH) pairs.push({ row: r.id, room: roomName(name), score: s })
    }
  }

  // A row whose two best rooms score the same has no clear room.
  const ambiguous = new Set<string>()
  for (const r of rows) {
    const mine = pairs.filter((p) => p.row === r.id).sort((a, b) => b.score - a.score)
    if (mine.length > 1 && mine[0].score === mine[1].score) ambiguous.add(r.id)
  }

  // Best agreement first, each room to one row only.
  pairs.sort((a, b) => b.score - a.score)
  const rooms = new Map<string, string>()
  const taken = new Set<string>()
  for (const p of pairs) {
    if (ambiguous.has(p.row) || rooms.has(p.row) || taken.has(p.room)) continue
    rooms.set(p.row, p.room)
    taken.add(p.room)
  }
  return { rooms, ambiguous: [...ambiguous] }
}

/** "racespot2" → "Racespot2", the spelling our room urls use */
function roomName(lower: string): string {
  return `Racespot${lower.slice('racespot'.length)}`
}
