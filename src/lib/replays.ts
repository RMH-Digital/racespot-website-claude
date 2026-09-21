import type { CalendarEvent } from './sheets'

/**
 * Which YouTube recording belongs to which past broadcast.
 *
 * The Master Schedule has no column for it — 3,209 past public rows, not one
 * YouTube link — so the pairing is worked out from the channel itself. Every
 * completed live stream carries `liveStreamingDetails.actualStartTime`, and a
 * broadcast that started within a few hours of the row's start time is that
 * row's recording. Titles help only to break ties: the sheet says "Porsche
 * Club of America S16 - Club", YouTube says "PCA Sim Racing Series 16 |
 * Event 2 | Club Class at Portland", so time is the signal and words are the
 * tie-breaker.
 *
 * Cost and freshness: the uploads playlist back to the cutoff (about 400
 * videos a year, 50 per page) plus one videos.list call per page — two quota
 * units per page, sixteen for the whole year.
 *
 * The newest page is refreshed every ten minutes, the rest once a day. That
 * split matters: a recording only exists once the stream has ended, and a
 * stream announced for next week only appears when it is scheduled, so the
 * near past and the near future change constantly while last February does
 * not. Until 2026-09-21 the whole index sat behind a single 24-hour entry,
 * and yesterday's broadcasts showed no recording and next week's no bell —
 * the data was simply a day old. Two units every ten minutes buys that back,
 * about 300 a day against a 10,000 quota.
 */

const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

/** How far back the index reaches — the calendar shows the same year. */
export const REPLAY_DAYS = 365
/** A stream is "the" recording if it went live this close to the scheduled start. */
const MATCH_WINDOW_MS = 3 * 60 * 60 * 1000
/** How long a page of uploads counts as current while it still holds recent videos */
const REVALIDATE_RECENT = 600
/** …and once it holds only settled history */
const REVALIDATE_ARCHIVE = 60 * 60 * 24
/** A video younger than this can still change: it may end, or be scheduled. */
const RECENT_DAYS = 14

export interface Replay {
  id: string
  title: string
  /** actualStartTime of a finished stream, scheduledStartTime of one still to come — ISO */
  start: string
  /** true once the stream has ended and is a recording */
  finished: boolean
}

/**
 * The channel's live streams of the past year, newest first.
 *
 * Not wrapped in `unstable_cache` any more: that cached the finished list
 * behind one expiry for everything in it, so the fresh half aged at the speed
 * of the stale half. Each request to YouTube now carries its own lifetime and
 * Next's fetch cache keeps it, which is both simpler and per-page correct.
 * Rebuilding the array on every render costs nothing — the calls behind it
 * are served from that cache.
 */
async function getReplayIndex(): Promise<Replay[]> {
  if (!API_KEY || !CHANNEL_ID) return []
  try {
    // The uploads playlist is the channel id with its "UC" swapped for "UU".
    const uploads = 'UU' + CHANNEL_ID.slice(2)
    const now = Date.now()
    const cutoff = now - REPLAY_DAYS * 86_400_000
    const recentHorizon = now - RECENT_DAYS * 86_400_000
    const replays: Replay[] = []
    let pageToken = ''
    // Set once a page reaches back past the horizon: everything after it is
    // older still, and gets the long lifetime.
    let settled = false

    for (let page = 0; page < 40; page++) {
      const revalidate = settled ? REVALIDATE_ARCHIVE : REVALIDATE_RECENT
      const url = `${BASE_URL}/playlistItems?part=contentDetails,snippet&playlistId=${uploads}&maxResults=50&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
      const res = await fetch(url, { next: { revalidate } })
      if (!res.ok) break
      const data = await res.json()

      const ids: string[] = []
      let reachedCutoff = false
      for (const item of data.items ?? []) {
        ids.push(item.contentDetails.videoId)
        // Uploads come newest first; publishedAt here is the upload/creation
        // time, a safe upper bound for the stream start.
        const published = Date.parse(item.snippet.publishedAt)
        if (published < cutoff) reachedCutoff = true
        if (published < recentHorizon) settled = true
      }

      if (ids.length) {
        // One videos.list per page, so a batch carries the lifetime of the
        // page it came from.
        const res2 = await fetch(`${BASE_URL}/videos?part=snippet,liveStreamingDetails&id=${ids.join(',')}&key=${API_KEY}`, { next: { revalidate } })
        if (res2.ok) {
          const videos = await res2.json()
          for (const v of videos.items ?? []) {
            const live = v.liveStreamingDetails
            if (!live) continue // a plain upload was never a broadcast
            if (live.actualEndTime && live.actualStartTime) {
              replays.push({ id: v.id, title: v.snippet.title, start: live.actualStartTime, finished: true })
            } else if (!live.actualStartTime && live.scheduledStartTime) {
              // Announced on YouTube but not yet live: the page where the
              // reader can set the bell.
              replays.push({ id: v.id, title: v.snippet.title, start: live.scheduledStartTime, finished: false })
            }
          }
        }
      }

      pageToken = data.nextPageToken ?? ''
      if (!pageToken || reachedCutoff) break
    }
    return replays
  } catch {
    return []
  }
}

const STOP = new Set(['the', 'of', 'and', 'at', 'in', 'on', 'de', 'la', 'le', 'a', 'series', 'season', 'round', 'event', 'class', 'sim', 'racing', 'esports', 'championship', 'cup', 'league'])

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w)),
  )
}

function overlap(a: string, b: string): number {
  const ta = tokens(a)
  const tb = tokens(b)
  if (ta.size === 0) return 0
  let hits = 0
  for (const w of ta) if (tb.has(w)) hits++
  return hits / ta.size
}

/**
 * Attach the YouTube video to every event that has one: the recording for a
 * past broadcast, the announced stream — where the bell lives — for an
 * upcoming one. Live events are left alone; they go to the live page. An
 * event with no stream within the window stays without `videoId`.
 */
export async function withReplays(events: CalendarEvent[]): Promise<CalendarEvent[]> {
  if (events.length === 0) return events
  const index = await getReplayIndex()
  if (index.length === 0) return events

  const byTime = index.map((r) => ({ ...r, t: Date.parse(r.start) })).sort((a, b) => a.t - b.t)
  const used = new Set<string>()

  return events.map((e) => {
    if (e.isLive) return e
    const t0 = Date.parse(e.dateISO)
    const candidates = byTime.filter((r) => !used.has(r.id) && r.finished === e.isPast && Math.abs(r.t - t0) <= MATCH_WINDOW_MS)
    if (candidates.length === 0) return e

    let best = candidates[0]
    if (candidates.length > 1) {
      // Words first — two classes of the same series can start minutes apart —
      // then the nearer start.
      best = [...candidates].sort((a, b) => {
        const d = overlap(e.series, b.title) - overlap(e.series, a.title)
        return d !== 0 ? d : Math.abs(a.t - t0) - Math.abs(b.t - t0)
      })[0]
    }
    used.add(best.id)
    return { ...e, videoId: best.id }
  })
}
