import 'server-only'
import { getSchedule, type ScheduleEvent } from '../sheets'

/**
 * Which Appgineering Live Timing room a broadcast uses.
 *
 * The rooms are fixed — `https://timing.appgineering.com/rooms/Racespot1`, 2,
 * 3 … — and the RaceSpot Talent Dashboard (~/racespot-talent-dashboard,
 * Scheduler tab) hands them out: sorted by start, each broadcast gets the
 * lowest room not in use by one still running (src/lib/scheduler/overlap.js,
 * allocateRooms), an admin can pin a room by hand, and the result is stored
 * in its Supabase table `sch_events.timing_room` and posted to Discord.
 *
 * Decided with Jürgen, 2026-10-07:
 *   1. Read the dashboard's answer — the room the crew and the Discord post
 *      use, overrides included. Rows match on its `sheet_row_key`,
 *      "<series lower-case>|<YYYY-MM-DD UTC>". A row the dashboard has with
 *      no room yet uses 1, as its Discord post does.
 *   2. When the dashboard cannot be read, or does not know the row, work it
 *      out the same way from the Master Schedule — every row, public or not,
 *      since a private broadcast occupies a room too.
 *
 * Read on the server only, once a minute for the process, like the schedule
 * and the live status. The anon key is the dashboard's public one (it ships
 * in its own JavaScript); the select names only the columns needed here.
 */
const URL_ = process.env.TALENT_SUPABASE_URL?.replace(/\/$/, '')
const KEY = process.env.TALENT_SUPABASE_ANON_KEY
const DEFAULT_BASE = 'https://timing.appgineering.com/rooms/Racespot'
const MEMO_MS = 60_000
const RETRY_MS = 30_000

interface Allocation {
  /** sheet_row_key → room */
  rooms: Map<string, number>
  base: string
}

let memo: { at: number; value: Allocation | null } | null = null
let reading: Promise<Allocation | null> | null = null

export function sheetRowKey(series: string, start: Date): string {
  return `${series.trim().toLowerCase()}|${start.toISOString().slice(0, 10)}`
}

async function readDashboard(): Promise<Allocation | null> {
  if (!URL_ || !KEY) return null
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` }
  const from = new Date(Date.now() - 2 * 86_400_000).toISOString()
  const to = new Date(Date.now() + 2 * 86_400_000).toISOString()
  const q = `select=sheet_row_key,timing_room,status&start_utc=gte.${from}&start_utc=lte.${to}`
  try {
    const [events, settings] = await Promise.all([
      fetch(`${URL_}/rest/v1/sch_events?${q}`, { headers, cache: 'no-store', signal: AbortSignal.timeout(6000) }),
      fetch(`${URL_}/rest/v1/sch_settings?select=timing_base_url&limit=1`, { headers, cache: 'no-store', signal: AbortSignal.timeout(6000) }),
    ])
    if (!events.ok) {
      console.warn('[timing] talent dashboard answered', events.status)
      return null
    }
    const rows: { sheet_row_key: string | null; timing_room: number | null; status: string }[] = await events.json()
    const rooms = new Map<string, number>()
    for (const r of rows) {
      if (!r.sheet_row_key || r.status === 'CANCELLED' || r.status === 'ARCHIVED') continue
      rooms.set(r.sheet_row_key, r.timing_room && r.timing_room >= 1 ? r.timing_room : 1)
    }
    let base = DEFAULT_BASE
    if (settings.ok) {
      const s: { timing_base_url?: string | null }[] = await settings.json()
      if (s[0]?.timing_base_url && /^https:\/\/timing\.appgineering\.com\/rooms\/[A-Za-z]+$/.test(s[0].timing_base_url)) base = s[0].timing_base_url
    }
    return { rooms, base }
  } catch (error) {
    console.warn('[timing] talent dashboard unreachable:', error instanceof Error ? error.message : error)
    return null
  }
}

async function dashboard(): Promise<Allocation | null> {
  const now = Date.now()
  if (memo && now < memo.at) return memo.value
  reading ??= readDashboard().finally(() => { reading = null })
  const value = await reading
  // Keep the last good answer through a failed read; retry sooner.
  if (value) memo = { at: now + MEMO_MS, value }
  else memo = { at: now + RETRY_MS, value: memo?.value ?? null }
  return memo.value
}

/** The dashboard's rule (allocateRooms), over the schedule itself */
function allocate(events: ScheduleEvent[]): Map<string, number> {
  const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime() || a.endDate.getTime() - b.endDate.getTime())
  const active: { end: number; room: number }[] = []
  const out = new Map<string, number>()
  for (const ev of sorted) {
    const start = ev.date.getTime()
    for (let i = active.length - 1; i >= 0; i--) if (active[i].end <= start) active.splice(i, 1)
    const used = new Set(active.map((a) => a.room))
    let room = 1
    while (used.has(room)) room++
    out.set(ev.id, room)
    active.push({ end: ev.endDate.getTime(), room })
  }
  return out
}

export interface TimingRoom {
  /** "Racespot2" — the room's name, also what the relay subscribes to */
  name: string
  /** Appgineering's own page for it */
  url: string
}

/** Rooms for the given schedule rows (by row id). */
export async function timingRooms(rows: ScheduleEvent[]): Promise<Map<string, TimingRoom>> {
  const out = new Map<string, TimingRoom>()
  if (rows.length === 0) return out
  const dash = await dashboard()
  const base = dash?.base ?? DEFAULT_BASE
  let computed: Map<string, number> | null = null
  for (const row of rows) {
    let room = dash?.rooms.get(sheetRowKey(row.series, row.date))
    if (room === undefined) {
      if (!computed) {
        // The day around the row is enough: rooms free up as broadcasts end.
        const from = row.date.getTime() - 86_400_000
        const to = row.date.getTime() + 86_400_000
        computed = allocate((await getSchedule()).filter((e) => e.endDate.getTime() > from && e.date.getTime() < to))
      }
      room = computed.get(row.id) ?? 1
    }
    const url = `${base}${room}`
    out.set(row.id, { name: url.slice(url.lastIndexOf('/') + 1), url })
  }
  return out
}

/**
 * Series that never have an ATVO timing — not iRacing. Used only when
 * Appgineering's list of live rooms cannot be read; normally that list
 * decides (a room is shown only while ATVO broadcasts to it). Proposed
 * 2026-10-07 from the schedule's series names, to be confirmed by the team;
 * the talent dashboard is to carry a per-event flag instead (see docs/TODO.md 7y).
 */
const NO_TIMING = [/rennsport/i, /racecraft/i, /\bvco\b/i, /le mans - manthey/i]

export function seriesHasTiming(series: string): boolean {
  return !NO_TIMING.some((re) => re.test(series))
}
