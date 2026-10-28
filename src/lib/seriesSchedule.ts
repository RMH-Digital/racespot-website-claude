import { getSchedule } from './sheets'
import { NEWS_SERIES } from './newsTaxonomy'

/**
 * Which news series RaceSpot broadcasts, and how important each is — read
 * from the Master Schedule, not kept by hand. There is no separate series
 * list from Philip and Hugo (Jürgen, 2026-10-28): the schedule with its tier
 * column (1 = top priority … 4) is that list.
 *
 * A series counts as ours when a public row of the last twelve months or the
 * future starts with one of its `calendar` names from taxonomy.json. Its tier
 * is the best tier among those rows. Nothing else is read, and it rides on
 * the schedule's own per-process memo — no extra request.
 */

export interface SeriesBroadcast {
  /** Best (lowest) tier among its rows in the window. */
  tier: number
  /** Start of its next public broadcast, if one is scheduled. */
  next?: string
}

const WINDOW_MS = 365 * 86_400_000

/** Lower case, anything but letters and digits as one space — "eNASCAR Coca-Cola" ≈ "enascar coca cola". */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim()

/**
 * Series id → its broadcast facts, for every series on the schedule. Empty
 * when the sheet does not answer; callers then simply show no badge.
 */
export async function seriesOnSchedule(now = Date.now()): Promise<Map<string, SeriesBroadcast>> {
  const out = new Map<string, SeriesBroadcast>()
  let rows
  try {
    rows = await getSchedule()
  } catch {
    return out
  }
  const prefixes = NEWS_SERIES.map((s) => ({ id: s.id, names: s.calendar.map(norm).filter(Boolean) }))
  for (const row of rows) {
    if (!row.isPublic || row.date.getTime() < now - WINDOW_MS) continue
    const name = norm(row.series)
    for (const { id, names } of prefixes) {
      if (!names.some((n) => name === n || name.startsWith(`${n} `))) continue
      const seen = out.get(id)
      const upcoming = row.date.getTime() > now ? row.date.toISOString() : undefined
      out.set(id, {
        tier: Math.min(seen?.tier ?? row.tier, row.tier),
        next: seen?.next && upcoming ? (seen.next < upcoming ? seen.next : upcoming) : seen?.next ?? upcoming,
      })
    }
  }
  return out
}

/** Order for series lists: broadcast series by tier, then the rest; within that the most recently covered first (the input order). */
export function byTier<T extends { series: { id: string } }>(list: T[], schedule: Map<string, SeriesBroadcast>): T[] {
  const rank = (x: T) => schedule.get(x.series.id)?.tier ?? 9
  return list
    .map((x, i) => ({ x, i }))
    .sort((a, b) => rank(a.x) - rank(b.x) || a.i - b.i)
    .map(({ x }) => x)
}
