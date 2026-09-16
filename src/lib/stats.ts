import { unstable_cache } from 'next/cache'

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
const OAUTH_CLIENT_ID = process.env.YOUTUBE_OAUTH_CLIENT_ID
const OAUTH_CLIENT_SECRET = process.env.YOUTUBE_OAUTH_CLIENT_SECRET
const OAUTH_REFRESH_TOKEN = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN

/** Twelve hours: the schedule moves slowly, and the API has a quota worth protecting. */
const REVALIDATE = 60 * 60 * 12

/**
 * Six hours for YouTube. Subscribers are the one number in the band that moves
 * on its own, and the display rounds to hundreds, so checking four times a day
 * is enough to show growth the day it happens — at four requests, well inside
 * the quota.
 */
const YT_REVALIDATE = 60 * 60 * 6

export interface SiteStats {
  /** Public broadcasts in the last 365 days */
  broadcasts: number
  /** Hours on air in the last 365 days */
  hours: number
  /** Distinct series covered in the last 365 days */
  series: number
  /** Lifetime views on the YouTube channel */
  youtubeViews: number
  /**
   * Hours watched on YouTube in the last 365 days, or null when the Analytics
   * API is not set up or did not answer — the band then shows hours on air
   * instead. Needs the OAuth trio in the environment: docs/YOUTUBE-ANALYTICS.md.
   */
  watchHours: number | null
  /** Followers across all social platforms combined */
  followers: number
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
  watchHours: null,        // no fallback on purpose: a stale figure under this label would be a claim we cannot show
  followers: 57_000, // measured 57,559
  languages: 8,
  live: false,
}

/**
 * Followers on the platforms that have no public API we can read.
 *
 * Supplied by the team from each platform's own analytics on **2026-09-14**,
 * and treated as a floor: these are the last counts we know to be true, and a
 * platform that has grown since only makes the total we show more conservative.
 * Jürgen sends updated figures now and then — raise them here, never lower
 * them on a guess.
 *
 * YouTube is deliberately not in this list: that one comes live from the Data
 * API below, so the band moves on its own between those updates. It matched the
 * team's figure exactly (34,200) when this was set up, which is a good sign for
 * the rest.
 */
const SOCIAL_FOLLOWERS: Record<string, number> = {
  x: 9_728,
  facebook: 7_692,
  instagram: 3_072,
  twitch: 2_467,
  tiktok: 400,
}

/** Fallback for the YouTube share when the API is unreachable (measured 34,200). */
const YOUTUBE_SUBSCRIBERS_FALLBACK = 34_000

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

async function youtubeChannel(): Promise<{ views: number; subscribers: number } | null> {
  if (!YT_KEY || !YT_CHANNEL) return null
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL}&key=${YT_KEY}`
    const res = await fetch(url, { next: { revalidate: YT_REVALIDATE } })
    if (!res.ok) return null
    const stats = (await res.json())?.items?.[0]?.statistics
    const views = Number(stats?.viewCount)
    const subscribers = Number(stats?.subscriberCount)
    if (!Number.isFinite(views) || views <= 0) return null
    return {
      views,
      subscribers: Number.isFinite(subscribers) && subscribers > 0 ? subscribers : YOUTUBE_SUBSCRIBERS_FALLBACK,
    }
  } catch {
    return null
  }
}

/**
 * Hours watched over the last 365 days, from the YouTube Analytics API.
 *
 * Unlike everything else in this file this needs the channel owner's consent,
 * obtained once with scripts/youtube-analytics-auth.mjs and stored as a
 * refresh token. The access token it yields lives an hour and changes every
 * time, which would defeat fetch()'s cache key, so the whole lookup is cached
 * with unstable_cache instead — once every six hours, like the subscribers.
 * Analytics data trails by about two days, so the window ends the day before
 * yesterday rather than today.
 */
const youtubeWatchHours = unstable_cache(
  async (): Promise<number | null> => {
    if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET || !OAUTH_REFRESH_TOKEN) return null
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: OAUTH_REFRESH_TOKEN,
          client_id: OAUTH_CLIENT_ID,
          client_secret: OAUTH_CLIENT_SECRET,
          grant_type: 'refresh_token',
        }),
        cache: 'no-store',
      })
      if (!tokenRes.ok) return null
      const accessToken = (await tokenRes.json())?.access_token
      if (typeof accessToken !== 'string') return null

      const end = new Date(Date.now() - 2 * 86_400_000)
      const start = new Date(end.getTime() - 365 * 86_400_000)
      const day = (d: Date) => d.toISOString().slice(0, 10)
      const query = new URLSearchParams({
        ids: 'channel==MINE',
        startDate: day(start),
        endDate: day(end),
        metrics: 'estimatedMinutesWatched',
      })
      const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      })
      if (!res.ok) return null
      const minutes = Number((await res.json())?.rows?.[0]?.[0])
      if (!Number.isFinite(minutes) || minutes <= 0) return null
      return Math.round(minutes / 60)
    } catch {
      return null
    }
  },
  ['youtube-watch-hours'],
  { revalidate: YT_REVALIDATE },
)

export async function getSiteStats(): Promise<SiteStats> {
  const [schedule, youtube, watchHours] = await Promise.all([scheduleStats(), youtubeChannel(), youtubeWatchHours()])

  const otherPlatforms = Object.values(SOCIAL_FOLLOWERS).reduce((a, b) => a + b, 0)
  const followers = otherPlatforms + (youtube?.subscribers ?? YOUTUBE_SUBSCRIBERS_FALLBACK)

  return {
    broadcasts: schedule?.broadcasts ?? FALLBACK.broadcasts,
    hours: schedule?.hours ?? FALLBACK.hours,
    series: schedule?.series ?? FALLBACK.series,
    youtubeViews: youtube?.views ?? FALLBACK.youtubeViews,
    watchHours,
    followers,
    languages: FALLBACK.languages,
    live: schedule !== null && youtube !== null,
  }
}

/**
 * Round *down*, so the number shown is always one we can beat, never one we
 * have to defend.
 *
 * `step` pins the granularity. Without it the step scales with the magnitude,
 * which is right for a lifetime view count (6,184,897 → "6.1M+") but wrong for
 * a figure we want to watch grow: rounding 410 broadcasts to "400+" hides the
 * next ten of them, and the band would sit unchanged for a year. Pass the step
 * the caller cares about — 10 for broadcasts, 100 for followers — and growth
 * shows up as soon as it crosses the step.
 */
export function roundedDown(n: number, locale: string, step?: number): string {
  const fmt = (v: number, digits = 0) =>
    v.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })

  if (step) return `${fmt(Math.floor(n / step) * step)}+`

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
