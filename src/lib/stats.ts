/**
 * The four numbers in the yellow band on the home page — measured, not claimed.
 *
 * Two sources, both of which we can point at if a client ever asks:
 *   - the Master Schedule sheet → broadcasts and hours over the last 12 months
 *   - the YouTube Data API      → lifetime channel views
 *
 * The previous band carried "100M+ impressions per year", a figure with no
 * source behind it. It is gone: an unsourced number damages the credibility of
 * the three that are real, and in Germany an advertising claim without a basis
 * is attackable under § 5 UWG. Broadcast hours took its place because we can
 * count them.
 *
 * Everything degrades to the last known-good figures if an API is unreachable,
 * so the band never shows a zero.
 */
import 'server-only'

const SHEET_ID = process.env.GOOGLE_SHEETS_ID
const SHEET_KEY = process.env.GOOGLE_SHEETS_API_KEY
const YT_KEY = process.env.YOUTUBE_API_KEY
const YT_CHANNEL = process.env.YOUTUBE_CHANNEL_ID

/** Twelve hours: these move slowly, and the APIs have quotas worth protecting. */
const REVALIDATE = 60 * 60 * 12

export interface SiteStats {
  /** Public broadcasts in the last 365 days */
  broadcasts: number
  /** Hours on air in the last 365 days */
  hours: number
  /** Distinct series covered in the last 365 days */
  series: number
  /** Lifetime views on the YouTube channel */
  youtubeViews: number
  /** Languages we broadcast in — not measurable, stated by the team */
  languages: number
  /** False when at least one source failed and a fallback is being shown */
  live: boolean
}

/**
 * Measured by hand on 2026-09-14 against both APIs, then rounded *down* — even
 * the fallback must be a figure we beat, never one we have to defend. Only
 * shown when a source is unreachable; re-measure if you touch this.
 */
const FALLBACK: SiteStats = {
  broadcasts: 400,   // measured 410
  hours: 1_000,      // measured 1,071
  series: 100,       // measured 104
  youtubeViews: 6_100_000, // measured 6,184,897
  languages: 8,
  live: false,
}

const EXCEL_EPOCH = Date.UTC(1899, 11, 30)

async function scheduleStats(): Promise<Pick<SiteStats, 'broadcasts' | 'hours' | 'series'> | null> {
  if (!SHEET_ID || !SHEET_KEY) return null
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Master%20Schedule!A2:R?key=${SHEET_KEY}&valueRenderOption=UNFORMATTED_VALUE`
    const res = await fetch(url, { next: { revalidate: REVALIDATE } })
    if (!res.ok) return null

    const rows: (string | number)[][] = (await res.json()).values || []
    const now = Date.now()
    const yearAgo = now - 365 * 86400000

    let broadcasts = 0
    let hours = 0
    const series = new Set<string>()

    for (const row of rows) {
      const serial = Number(row[1])
      if (!serial || Number.isNaN(serial)) continue
      const when = EXCEL_EPOCH + serial * 86400000
      if (when < yearAgo || when > now) continue          // last 12 months only
      if (String(row[6]).toLowerCase() !== 'yes') continue // public broadcasts only
      const name = String(row[10] || '').trim()
      if (!name) continue

      broadcasts++
      hours += (Number(row[3]) || 0) * 24 // sheet stores duration as a day fraction
      series.add(name)
    }

    if (broadcasts === 0) return null
    return { broadcasts, hours: Math.round(hours), series: series.size }
  } catch {
    return null
  }
}

async function youtubeViews(): Promise<number | null> {
  if (!YT_KEY || !YT_CHANNEL) return null
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL}&key=${YT_KEY}`
    const res = await fetch(url, { next: { revalidate: REVALIDATE } })
    if (!res.ok) return null
    const views = Number((await res.json())?.items?.[0]?.statistics?.viewCount)
    return Number.isFinite(views) && views > 0 ? views : null
  } catch {
    return null
  }
}

export async function getSiteStats(): Promise<SiteStats> {
  const [schedule, views] = await Promise.all([scheduleStats(), youtubeViews()])

  return {
    broadcasts: schedule?.broadcasts ?? FALLBACK.broadcasts,
    hours: schedule?.hours ?? FALLBACK.hours,
    series: schedule?.series ?? FALLBACK.series,
    youtubeViews: views ?? FALLBACK.youtubeViews,
    languages: FALLBACK.languages,
    live: schedule !== null && views !== null,
  }
}

/**
 * Round *down* to a "400+" style figure, so the number shown is always one we
 * can beat, never one we have to defend. 416 → "400+", 6,184,897 → "6.1M+".
 */
export function roundedDown(n: number, locale: string): string {
  const fmt = (v: number, digits = 0) =>
    v.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })

  // Millions keep one decimal: 6,184,897 → "6.1M+" (and "6,1M+" in German)
  if (n >= 1_000_000) return `${fmt(Math.floor((n / 1_000_000) * 10) / 10, 1)}M+`
  // Ten thousand and up: down to the nearest thousand
  if (n >= 10_000) return `${fmt(Math.floor(n / 1_000) * 1_000)}+`
  // Thousands: down to the nearest hundred, so 1,118 stays "1,100+" not "1,000+"
  if (n >= 1_000) return `${fmt(Math.floor(n / 100) * 100)}+`
  if (n >= 100) return `${fmt(Math.floor(n / 100) * 100)}+`
  if (n >= 10) return `${fmt(Math.floor(n / 10) * 10)}+`
  return fmt(n)
}
