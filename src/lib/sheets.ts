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
 */

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

/**
 * Parse a row from the sheet into a ScheduleEvent
 */
function parseRow(row: (string | number)[]): ScheduleEvent | null {
  const dateSerial = Number(row[1])
  const timeDecimal = Number(row[2]) || 0
  const durationDecimal = Number(row[3]) || 0
  const isPublic = String(row[6]).toLowerCase() === 'yes'
  const series = String(row[10] || '').trim()

  // Skip rows with no valid date or series name
  if (!dateSerial || isNaN(dateSerial) || !series) return null

  const eventDate = excelSerialToDate(dateSerial, timeDecimal)
  const endDate = excelSerialToDate(dateSerial, timeDecimal + durationDecimal)
  const now = new Date()

  // Determine status
  // Add 90-minute buffer after scheduled end — broadcasts often run overtime
  const liveBuffer = new Date(endDate.getTime() + 90 * 60 * 1000)
  const isLive = now >= eventDate && now <= liveBuffer
  const isUpcoming = eventDate > now
  const isPast = now > liveBuffer

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
    isLive,
    isUpcoming,
    isPast,
  }
}

/**
 * Fetch upcoming events from the Master Schedule
 * Gets the last ~300 rows to cover several months of data
 */
export async function getUpcomingEvents(limit = 20): Promise<ScheduleEvent[]> {
  if (!API_KEY || !SHEET_ID) {
    console.warn('Google Sheets API key or Sheet ID not configured')
    return []
  }

  try {
    // Fetch all data rows (skip header row 1)
    const url = `${BASE_URL}/${SHEET_ID}/values/Master%20Schedule!A2:R?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`
    const res = await fetch(url, { next: { revalidate: 300 } }) // 5 min cache

    if (!res.ok) {
      console.error('Google Sheets API error:', res.status, await res.text())
      return []
    }

    const data = await res.json()
    const rows = data.values || []

    const events = rows
      .map((row: (string | number)[]) => parseRow(row))
      .filter((e: ScheduleEvent | null): e is ScheduleEvent => {
        if (!e) return false
        if (!e.isPublic) return false
        // Only upcoming or currently live events
        return e.isUpcoming || e.isLive
      })
      .sort((a: ScheduleEvent, b: ScheduleEvent) => a.date.getTime() - b.date.getTime())
      .slice(0, limit)

    return events
  } catch (error) {
    console.error('Google Sheets fetch error:', error)
    return []
  }
}

/**
 * Fetch ALL events for a specific month (for calendar view)
 */
export async function getEventsForMonth(year: number, month: number): Promise<ScheduleEvent[]> {
  if (!API_KEY || !SHEET_ID) return []

  try {
    // Fetch all data rows (skip header row 1)
    const url = `${BASE_URL}/${SHEET_ID}/values/Master%20Schedule!A2:R?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`
    const res = await fetch(url, { next: { revalidate: 300 } })

    if (!res.ok) return []

    const data = await res.json()
    const rows = data.values || []

    const events = rows
      .map((row: (string | number)[]) => parseRow(row))
      .filter((e: ScheduleEvent | null): e is ScheduleEvent => {
        if (!e || !e.isPublic) return false
        return e.date.getUTCFullYear() === year && e.date.getUTCMonth() === month
      })
      .sort((a: ScheduleEvent, b: ScheduleEvent) => a.date.getTime() - b.date.getTime())

    return events
  } catch (error) {
    console.error('Google Sheets fetch error:', error)
    return []
  }
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
  }
}

/**
 * Fetch ALL public upcoming events (no limit) for the calendar view.
 * Returns JSON-safe CalendarEvent objects.
 */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  if (!API_KEY || !SHEET_ID) {
    console.warn('Google Sheets API key or Sheet ID not configured')
    return []
  }

  try {
    // Fetch all data rows (skip header row 1)
    const url = `${BASE_URL}/${SHEET_ID}/values/Master%20Schedule!A2:R?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`
    const res = await fetch(url, { next: { revalidate: 300 } })

    if (!res.ok) {
      console.error('Google Sheets API error:', res.status, await res.text())
      return []
    }

    const data = await res.json()
    const rows = data.values || []

    return rows
      .map((row: (string | number)[]) => parseRow(row))
      .filter((e: ScheduleEvent | null): e is ScheduleEvent => {
        if (!e) return false
        if (!e.isPublic) return false
        return e.isUpcoming || e.isLive
      })
      .sort((a: ScheduleEvent, b: ScheduleEvent) => a.date.getTime() - b.date.getTime())
      .map(toCalendarEvent)
  } catch (error) {
    console.error('Google Sheets fetch error:', error)
    return []
  }
}

/**
 * Get unique series names with their best (lowest) tier.
 * Used to rank YouTube playlists by tier.
 */
export async function getSeriesTiers(): Promise<{ series: string; tier: number }[]> {
  if (!API_KEY || !SHEET_ID) return []

  try {
    // Fetch all rows to cover all series
    const url = `${BASE_URL}/${SHEET_ID}/values/Master%20Schedule!A2:K?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`
    const res = await fetch(url, { next: { revalidate: 600 } }) // 10 min cache

    if (!res.ok) return []

    const data = await res.json()
    const rows: (string | number)[][] = data.values || []

    // Collect best tier per series
    const tierMap = new Map<string, number>()
    for (const row of rows) {
      const tier = Number(row[0])
      const series = String(row[10] || '').trim()
      if (!series || !tier || isNaN(tier)) continue

      const existing = tierMap.get(series)
      if (existing === undefined || tier < existing) {
        tierMap.set(series, tier)
      }
    }

    const result: { series: string; tier: number }[] = []
    tierMap.forEach((tier, series) => {
      result.push({ series, tier })
    })

    return result
  } catch (error) {
    console.error('getSeriesTiers error:', error)
    return []
  }
}

/**
 * Format event date for display: "Sat 15 Mar"
 */
export function formatEventDate(date: Date): { day: number; month: string; weekday: string } {
  return {
    day: date.getUTCDate(),
    month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
  }
}

/**
 * Extract sim platform from series name
 * e.g. "iRacing Short Course" -> "iRacing"
 */
export function extractSim(series: string): string {
  const lower = series.toLowerCase()
  if (lower.includes('iracing')) return 'iRacing'
  if (lower.includes('assetto') || lower.includes('acc')) return 'ACC'
  if (lower.includes('rfactor')) return 'rFactor 2'
  if (lower.includes('f1') || lower.includes('ea sports')) return 'F1 24'
  if (lower.includes('nascar')) return 'NASCAR'
  if (lower.includes('radical')) return 'iRacing'
  return 'Sim'
}
