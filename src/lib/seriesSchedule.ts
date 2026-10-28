import 'server-only'
import { getSchedule } from './sheets'
import { pastBroadcasts } from './broadcasts'
import { NEWS_SERIES } from './newsTaxonomy'

/**
 * Which news series RaceSpot broadcasts, and how important each is — read
 * from the Master Schedule, not kept by hand. There is no separate series
 * list from Philip and Hugo (Jürgen, 2026-10-28): the schedule with its tier
 * column (1 = top priority … 4) is that list.
 *
 * A series counts as ours when a public row starts with one of its
 * `calendar` names from taxonomy.json **and** we can show it: one of its past
 * rows has a recording (/api/broadcasts, lib/broadcasts.ts), or one is
 * scheduled within the next 30 days. A row alone was not enough (Jürgen,
 * 2026-10-28): five public Supercup rows from the summer with no stream
 * anywhere gave the series a „Broadcast by RaceSpot“ badge it could not back
 * up. Its tier is the best tier among its rows of the last twelve months and
 * the future. Both reads ride on per-process memos the calendar fills anyway —
 * no extra request.
 */

export interface SeriesBroadcast {
  /** Best (lowest) tier among its rows in the window. */
  tier: number
  /** Start of its next public broadcast, if one is scheduled. */
  next?: string
}

const WINDOW_MS = 365 * 86_400_000
/** A scheduled broadcast this close counts even before anything was recorded. */
const SOON_MS = 30 * 86_400_000

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
  const seriesOf = (rowName: string) => {
    const name = norm(rowName)
    return prefixes.filter(({ names }) => names.some((n) => name === n || name.startsWith(`${n} `))).map((p) => p.id)
  }

  // Which series we can show: a recording, or a broadcast within 30 days.
  const shown = new Set<string>()
  try {
    for (const b of await pastBroadcasts()) for (const id of seriesOf(b.series)) shown.add(id)
  } catch { /* no recordings known: only the upcoming rule applies */ }
  for (const row of rows) {
    const t = row.date.getTime()
    if (row.isPublic && t > now && t <= now + SOON_MS) for (const id of seriesOf(row.series)) shown.add(id)
  }

  for (const row of rows) {
    if (!row.isPublic || row.date.getTime() < now - WINDOW_MS) continue
    for (const id of seriesOf(row.series)) {
      if (!shown.has(id)) continue
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
