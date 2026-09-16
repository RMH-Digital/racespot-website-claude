import { unstable_cache } from 'next/cache'
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
 * Cost: the uploads playlist back to the cutoff (about 400 videos a year, 50
 * per page) plus one videos.list call per 50 — roughly twenty quota units,
 * once a day.
 */

const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

/** How far back the index reaches — the calendar shows the same year. */
export const REPLAY_DAYS = 365
/** A stream is "the" recording if it went live this close to the scheduled start. */
const MATCH_WINDOW_MS = 3 * 60 * 60 * 1000
const REVALIDATE = 60 * 60 * 24

export interface Replay {
  id: string
  title: string
  /** actualStartTime of a finished stream, scheduledStartTime of one still to come — ISO */
  start: string
  /** true once the stream has ended and is a recording */
  finished: boolean
}

const getReplayIndex = unstable_cache(
  async (): Promise<Replay[]> => {
    if (!API_KEY || !CHANNEL_ID) return []
    try {
      // The uploads playlist is the channel id with its "UC" swapped for "UU".
      const uploads = 'UU' + CHANNEL_ID.slice(2)
      const cutoff = Date.now() - REPLAY_DAYS * 86_400_000
      const ids: string[] = []
      let pageToken = ''

      for (let page = 0; page < 40; page++) {
        const url = `${BASE_URL}/playlistItems?part=contentDetails,snippet&playlistId=${uploads}&maxResults=50&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) break
        const data = await res.json()
        let reachedCutoff = false
        for (const item of data.items ?? []) {
          ids.push(item.contentDetails.videoId)
          // Uploads come newest first; publishedAt here is the upload/creation
          // time, a safe upper bound for the stream start.
          if (Date.parse(item.snippet.publishedAt) < cutoff) reachedCutoff = true
        }
        pageToken = data.nextPageToken ?? ''
        if (!pageToken || reachedCutoff) break
      }

      const replays: Replay[] = []
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50).join(',')
        const res = await fetch(`${BASE_URL}/videos?part=snippet,liveStreamingDetails&id=${batch}&key=${API_KEY}`, { cache: 'no-store' })
        if (!res.ok) continue
        const data = await res.json()
        for (const v of data.items ?? []) {
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
      return replays
    } catch {
      return []
    }
  },
  // v2: entries carry `finished`; an older cached index would match nothing.
  ['youtube-replay-index-v2', String(REPLAY_DAYS)],
  { revalidate: REVALIDATE },
)

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
