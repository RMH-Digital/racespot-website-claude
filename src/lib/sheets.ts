/**
 * Google Sheets API integration for RaceSpot Master Schedule
 *
 * Sheet columns (Master Schedule):
 *   A: Tier (1-4 priority)
 *   B: Date (Excel serial number)
 *   C: UTC (decimal time, e.g. 0.875 = 21:00)
 *   D: Duration (decimal, e.g. 0.125 = 3 hours)
 *   E: Date End (serial + decimal)
 *   F: Time End
 *   G: Public? ("Yes"/"No")
 *   H: Destination (e.g. "RaceSpot's YT")
 *   I: Castr
 *   J: Zoom
 *   K: Series Code and Name
 *   L: Description
 *   M: Prod (producer)
 *   N-P: Comm (commentators)
 *   Q: Trigger
 *   R: ID
 *
 * The sheet is read as one range, once, and parsed once a minute at most —
 * see readSchedule(). Everything exported here is a view of that one parse.
 */

import type { ScheduledBroadcast } from './youtube'

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
const SHEET_ID = process.env.GOOGLE_SHEETS_ID
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

export interface ScheduleEvent {
  id: string
  tier: number
  date: Date
  dateString: string     // "2026-03-15"
  timeString: string     // "20:00 UTC"
  durationHours: number
  endDate: Date
  isPublic: boolean
  destination: string
  series: string
  description: string
  producer: string
  commentators: string[]
  isLive: boolean
  isUpcoming: boolean
  isPast: boolean
}

/** JSON-safe version for passing to client components */
export interface CalendarEvent {
  id: string
  tier: number
  series: string
  description: string
  dateISO: string        // ISO 8601 string (UTC)
  endDateISO: string
  durationHours: number
  isLive: boolean
  /** Over, including the 90-minute overtime buffer */
  isPast: boolean
  /** The YouTube video: the recording of a past broadcast, the announced stream of an upcoming one — see src/lib/replays.ts */
  videoId?: string
  /** Every part, in order, when one broadcast was streamed in several — `videoId` is the first of them */
  videoParts?: string[]
}

/**
 * An id that is the same every time we read the same row.
 *
 * Column R carries one when the sheet has it. When it does not, this derives
 * one from the broadcast itself — it used to be `Math.random()`, which gave
 * the same broadcast a different identity on every fetch. Harmless for a
 * React key that lives for one render; fatal for the calendar feed, where the
 * UID is how a subscriber's calendar recognises an event it already has. With
 * a random one, every refresh would have looked like a fresh set of
 * broadcasts and notified all over again.
 *
 * FNV-1a: short, stable, and no dependency.
 */
function stableId(series: string, start: Date): string {
  const input = `${series}|${start.toISOString()}`
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Convert Excel serial date number to JavaScript Date
 * Excel epoch = Dec 30, 1899 (due to the Lotus 123 leap year bug)
 */
function excelSerialToDate(serial: number, timeFraction = 0): Date {
  const EXCEL_EPOCH = Date.UTC(1899, 11, 30) // Dec 30, 1899
  const dayMs = serial * 86400000
  const timeMs = timeFraction * 86400000
  return new Date(EXCEL_EPOCH + dayMs + timeMs)
}

/**
 * Convert decimal time fraction to "HH:MM UTC" string
 */
function decimalTimeToString(decimal: number): string {
  const totalMinutes = Math.round(decimal * 24 * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC`
}

/**
 * Convert decimal duration to hours
 */
function decimalToHours(decimal: number): number {
  return Math.round(decimal * 24 * 10) / 10 // round to 1 decimal
}

/** A row as the sheet has it — everything but what depends on the clock. */
type ParsedRow = Omit<ScheduleEvent, 'isLive' | 'isUpcoming' | 'isPast'>

/**
 * Parse a row from the sheet
 */
function parseRow(row: (string | number)[]): ParsedRow | null {
  const dateSerial = Number(row[1])
  const timeDecimal = Number(row[2]) || 0
  const durationDecimal = Number(row[3]) || 0
  const isPublic = String(row[6]).toLowerCase() === 'yes'
  const series = String(row[10] || '').trim()

  // Skip rows with no valid date or series name
  if (!dateSerial || isNaN(dateSerial) || !series) return null

  const eventDate = excelSerialToDate(dateSerial, timeDecimal)
  const endDate = excelSerialToDate(dateSerial, timeDecimal + durationDecimal)

  return {
    id: String(row[17] || '').trim() || stableId(series, eventDate),
    tier: Number(row[0]) || 4,
    date: eventDate,
    dateString: eventDate.toISOString().split('T')[0],
    timeString: decimalTimeToString(timeDecimal),
    durationHours: decimalToHours(durationDecimal),
    endDate,
    isPublic,
    destination: String(row[7] || ''),
    series,
    description: String(row[11] || ''),
    producer: String(row[12] || ''),
    commentators: [
      String(row[13] || ''),
      String(row[14] || ''),
      String(row[15] || ''),
    ].filter(c => {
      if (!c || c === 'undefined' || c === 'TBD') return false
      const lower = c.toLowerCase().trim()
      // Filter out placeholder values
      if (lower.includes('away') || lower === 'client' || lower === 'tbc' || lower === 'tba') return false
      return true
    }),
  }
}

/** Broadcasts often run overtime: a row counts as live for this long past its end. */
const OVERTIME_MS = 90 * 60 * 1000

/** Stamp a row with what the clock says about it right now. */
function withStatus(e: ParsedRow, now: number): ScheduleEvent {
  const start = e.date.getTime()
  const liveUntil = e.endDate.getTime() + OVERTIME_MS
  return { ...e, isLive: now >= start && now <= liveUntil, isUpcoming: start > now, isPast: now > liveUntil }
}

/**
 * The whole sheet, parsed once and kept for a minute.
 *
 * Next's fetch cache already answers the request itself from disk for five
 * minutes — but the answer is a megabyte of JSON for 3,500 rows, and until
 * 2026-09-22 every caller parsed all of it again: the ticker in the layout,
 * the page beside it, and /api/live-streams for every open tab, once a
 * minute. Now the parse happens once a minute at most and shared by everyone
 * in the process; a caller only stamps the rows with the clock, because
 * "live" has to turn true the second a broadcast starts, not up to a minute
 * later. One container, so one memo is the whole cache — the same trade the
 * contact form's rate limiter makes.
 *
 * When the sheet cannot be read, the last parse stands: a minute-old schedule
 * beats an empty calendar, and the error is in the log either way.
 *
 * getSchedule() is the raw view — every row, public or not, status stamped —
 * for callers that count rather than display (stats.ts). Everything that
 * renders goes through the filtered exports below.
 */
const PARSE_MEMO_MS = 60_000
let parsed: { at: number; rows: ParsedRow[] } | null = null
let parsing: Promise<ParsedRow[] | null> | null = null

export async function getSchedule(): Promise<ScheduleEvent[]> {
  return readSchedule()
}

async function readSchedule(): Promise<ScheduleEvent[]> {
  if (!API_KEY || !SHEET_ID) {
    console.warn('Google Sheets API key or Sheet ID not configured')
    return []
  }
  const now = Date.now()
  if (!parsed || now - parsed.at > PARSE_MEMO_MS) {
    // One fetch for everyone who asks while it runs.
    parsing ??= fetchRows().finally(() => { parsing = null })
    const rows = await parsing
    if (rows) parsed = { at: now, rows }
  }
  return (parsed?.rows ?? []).map((r) => withStatus(r, now))
}

/** Every usable row, sorted by start. Null when the sheet did not answer. */
async function fetchRows(): Promise<ParsedRow[] | null> {
  try {
    // Fetch all data rows (skip header row 1)
    const url = `${BASE_URL}/${SHEET_ID}/values/Master%20Schedule!A2:R?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`
    const res = await fetch(url, { next: { revalidate: 300 } }) // 5 min cache

    if (!res.ok) {
      console.error('Google Sheets API error:', res.status, await res.text())
      return null
    }

    const rows: (string | number)[][] = (await res.json()).values || []
    const out: ParsedRow[] = []
    for (const row of rows) {
      const e = parseRow(row)
      if (e) out.push(e)
    }
    out.sort((a, b) => a.date.getTime() - b.date.getTime())
    return out
  } catch (error) {
    console.error('Google Sheets fetch error:', error)
    return null
  }
}

/**
 * Public broadcasts that are on air or still to come, earliest first.
 */
export async function getUpcomingEvents(limit = 20): Promise<ScheduleEvent[]> {
  const events = await readSchedule()
  return events.filter((e) => e.isPublic && (e.isUpcoming || e.isLive)).slice(0, limit)
}

/** Convert ScheduleEvent → CalendarEvent (JSON-safe for client) */
export function toCalendarEvent(e: ScheduleEvent): CalendarEvent {
  return {
    id: e.id,
    tier: e.tier,
    series: e.series,
    description: e.description,
    dateISO: e.date.toISOString(),
    endDateISO: e.endDate.toISOString(),
    durationHours: e.durationHours,
    isLive: e.isLive,
    isPast: e.isPast,
  }
}

/** How far back the calendar reaches; the replay index in replays.ts uses the same year. */
const CALENDAR_PAST_DAYS = 365

/**
 * Every public broadcast for the calendar view — all upcoming ones, and the
 * past year. Past broadcasts stay so that the earlier months are a record with
 * recordings behind them rather than blank pages. JSON-safe.
 */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const floor = Date.now() - CALENDAR_PAST_DAYS * 86_400_000
  return (await readSchedule())
    .filter((e) => e.isPublic && (e.isUpcoming || e.isLive || e.date.getTime() > floor))
    .map(toCalendarEvent)
}

/**
 * Get unique series names with their best (lowest) tier.
 * Used to rank YouTube playlists by tier.
 */
export async function getSeriesTiers(): Promise<{ series: string; tier: number }[]> {
  const tierMap = new Map<string, number>()
  for (const e of await readSchedule()) {
    const existing = tierMap.get(e.series)
    if (existing === undefined || e.tier < existing) tierMap.set(e.series, e.tier)
  }
  return Array.from(tierMap, ([series, tier]) => ({ series, tier }))
}

/** How early live detection starts watching a scheduled broadcast — streams open with a pre-show. */
const WATCH_LEAD_MS = 15 * 60 * 1000

/**
 * The broadcast live detection should be watching: the one on air, or the
 * one about to start. While there is one, getLiveStreams() asks YouTube once
 * a minute; while there is none, once in five — and its id keys the search
 * budget, so a single broadcast cannot spend more than its share however long
 * it runs. Expects the list getUpcomingEvents() returns, earliest first.
 */
export function watchedBroadcast(events: ScheduleEvent[], now = Date.now()): ScheduledBroadcast | undefined {
  const e = events.find((e) => e.isLive) ?? events.find((e) => e.isUpcoming && e.date.getTime() - now <= WATCH_LEAD_MS)
  return e ? { key: e.id, start: e.date.getTime() } : undefined
}
