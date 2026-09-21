import type { CalendarEvent } from './sheets'

/**
 * Which YouTube recording belongs to which past broadcast.
 *
 * The Master Schedule has no column for it — 3,209 past public rows, not one
 * YouTube link — so the pairing is worked out from the channels themselves.
 * Every
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

/**
 * Channels other than our own that carry broadcasts the schedule lists.
 *
 * Not everything we produce goes out on our channel. The eNASCAR Coca-Cola
 * iRacing Series BS+ Team Stream is broadcast on the client's channel, and
 * the schedule's destination column says "RaceSpot's YT" for it like for
 * everything else — so until 2026-09-21 those rows could never find a
 * recording, because we were only ever reading our own uploads.
 *
 * A channel id is public; it lives here rather than in the environment so
 * that adding one is a reviewed change with its reason beside it. What a
 * partner channel carries besides our broadcasts — interviews, clips, other
 * disciplines — cannot be matched by accident: only live streams enter the
 * index at all, and a stream from here has to share half its title with the
 * series name before it is considered (see PARTNER_TITLE_OVERLAP).
 */
const PARTNER_CHANNELS: { id: string; name: string }[] = [
  { id: 'UCShyEtI5TtHi5y_4G3owN6A', name: 'BSCOMPETITION' },
]

/** How far back the index reaches — the calendar shows the same year. */
export const REPLAY_DAYS = 365
/** A stream is "the" recording if it went live this close to the scheduled start. */
const MATCH_WINDOW_MS = 3 * 60 * 60 * 1000
/**
 * Inside this much of the scheduled start, the clock decides on its own.
 *
 * Beyond it, the schedule name and the stream title have to share at least
 * one real word. Without that rule a row whose own broadcast was never
 * recorded reached out and took whatever else was running: "Porsche Carrera
 * Cup Deutschland Onboard" ended up on "iRacing Petit Le Mans", "VCO ERC" on
 * "iRacing Daytona 24". Endurance streams run for hours, so something is
 * nearly always within three hours of anything.
 *
 * A bare number does not count as that shared word — "Rennsport Summit #2"
 * and "iRacing Bathurst 12 | Part 2" have only the "2" in common.
 *
 * An hour, because the schedule and the channel disagree by a systematic
 * fifty-odd minutes for stretches of the record — every Porsche Club round of
 * season 14, every Svensk eRacingLigan evening, every British F4 round of
 * 2025. Those are the right recordings under the wrong clock, and they are
 * far too many to throw away.
 */
const CLOSE_ENOUGH_MS = 60 * 60 * 1000
/**
 * A broadcast split across several streams: the next part goes live within
 * minutes of the previous one ending. Britcar 24 is four parts of six hours
 * with gaps of twenty, thirty-seven and twenty-seven seconds.
 */
const PART_GAP_MS = 20 * 60 * 1000
/** …and carries almost the same title, which is what separates a part from the next broadcast. */
const PART_TITLE_OVERLAP = 0.75
/**
 * On our own channel the clock alone identifies a broadcast — everything
 * there is ours. On a partner channel it does not, so the title has to agree
 * too: "eNASCAR Coca Cola iRacing Series BS+ Team Stream" against "eNASCAR
 * Coca-Cola iRacing Series 2026 - Michigan International Speedway - Round 10"
 * shares four of seven words. Anything else that channel streams shares none.
 */
const PARTNER_TITLE_OVERLAP = 0.5
/** How long a page of uploads counts as current while it still holds recent videos */
const REVALIDATE_RECENT = 600
/**
 * …and the same for a partner channel. Longer on purpose: we broadcast
 * several times a day, a partner channel carries one of our rounds a
 * fortnight, and half an hour to a recording appearing there is nobody's
 * problem. It halves what the extra channel costs.
 */
const REVALIDATE_PARTNER_RECENT = 1800
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
  /** actualEndTime of a finished stream — where the next part picks up */
  end?: string
  /** The channel it came from: ours, or one of PARTNER_CHANNELS */
  channel: string
}

/**
 * Every channel's live streams of the past year, newest first.
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
  const lists = await Promise.all([
    channelStreams(CHANNEL_ID, REVALIDATE_RECENT),
    ...PARTNER_CHANNELS.map((c) => channelStreams(c.id, REVALIDATE_PARTNER_RECENT)),
  ])
  return lists.flat()
}

/** One channel's uploads, read back to the cutoff and reduced to its live streams. */
async function channelStreams(channelId: string, recentTtl: number): Promise<Replay[]> {
  try {
    // The uploads playlist is the channel id with its "UC" swapped for "UU".
    const uploads = 'UU' + channelId.slice(2)
    const now = Date.now()
    const cutoff = now - REPLAY_DAYS * 86_400_000
    const recentHorizon = now - RECENT_DAYS * 86_400_000
    const replays: Replay[] = []
    let pageToken = ''
    // Set once a page reaches back past the horizon: everything after it is
    // older still, and gets the long lifetime.
    let settled = false

    for (let page = 0; page < 40; page++) {
      const revalidate = settled ? REVALIDATE_ARCHIVE : recentTtl
      const url = `${BASE_URL}/playlistItems?part=contentDetails,snippet&playlistId=${uploads}&maxResults=50&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
      const res = await fetch(url, { next: { revalidate } })
      if (!res.ok) {
        // Worth saying out loud: an empty index means every past broadcast
        // loses its recording and every announced one its bell, and the page
        // itself renders perfectly well without either.
        console.warn(`[replays] uploads page ${page + 1} of ${channelId} failed: ${res.status}`)
        break
      }
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
              replays.push({ id: v.id, title: v.snippet.title, start: live.actualStartTime, end: live.actualEndTime, finished: true, channel: channelId })
            } else if (!live.actualStartTime && live.scheduledStartTime) {
              // Announced on YouTube but not yet live: the page where the
              // reader can set the bell.
              replays.push({ id: v.id, title: v.snippet.title, start: live.scheduledStartTime, finished: false, channel: channelId })
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

/**
 * The same series under two names.
 *
 * The schedule and the channel do not always call a series the same thing, and
 * where they differ they differ every single time. Measured over the past year
 * of matches, these are all of them: the schedule writes "Porsche Club of
 * America S16 - Pro", the stream is titled "PCA Sim Racing Series 16 | Event 3
 * | Pro Class at Sonoma", and the only word the two share is "Pro" — which the
 * iRacing Short Course *Pro* 2 National Series, starting twenty minutes
 * earlier, shares just as well. That is how it took the Porsche recording on
 * 2026-09-24.
 *
 * Each entry maps every spelling to one token, applied to both strings before
 * they are cut into words — so it runs before the stop list and a phrase like
 * "sim gaming expo" survives, although "sim" alone would have been dropped.
 * Longest form first inside a pattern, since the first alternative wins.
 *
 * Only put a name in here when the schedule and the channel genuinely mean the
 * same series. Anything else would make two different broadcasts look alike.
 */
const ALIASES: [RegExp, string][] = [
  // "PCA Sim Racing Series 16" ←→ "Porsche Club of America S16"
  [/\bporsche club of america\b|\bpca\b/g, 'pca'],
  // "The 2026 Esports Racing League Final4" ←→ "VCO ERL"
  [/\besports racing league\b|\berl\b/g, 'erl'],
  // The sponsor in front of the iRX Championship changes between seasons
  [/\bnext level racing\b|\bnlr\b/g, 'nlr'],
  [/\bchannel ?199\b/g, 'channel199'],
  // "Racecraft Rallycross" ←→ "… iRX Championship"
  [/\brallycross\b|\birx\b/g, 'irx'],
  // "Sim Gaming Expo Challenge Series" ←→ "SimGamingExpo Qualifiers"
  [/\bsim gaming expo\b|\bsimgamingexpo\b/g, 'simgamingexpo'],
  // "Bohlin's Svenska Eracingligan" ←→ "Svensk eRacingLigan"
  [/\bsvenska\b/g, 'svensk'],
]

const STOP = new Set(['the', 'of', 'and', 'at', 'in', 'on', 'de', 'la', 'le', 'a', 'series', 'season', 'round', 'event', 'class', 'sim', 'racing', 'esports', 'championship', 'cup', 'league'])

function tokens(s: string): Set<string> {
  let t = s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
  for (const [pattern, canonical] of ALIASES) t = t.replace(pattern, canonical)
  return new Set(t.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)))
}

/** Do these two share a word that is not a bare number? */
function sharesAWord(a: string, b: string): boolean {
  const tb = tokens(b)
  for (const w of tokens(a)) if (!/^\d+$/.test(w) && tb.has(w)) return true
  return false
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
 *
 * Two passes, and the order is the point. First every possible pairing of an
 * event with a stream is scored, and the best pairings are settled first —
 * not the earliest row first, which let a row take a recording another row
 * named better. Only then does an event
 * reach forward for the parts that continue its broadcast — a twenty-four
 * hour race goes out as four six-hour streams, and the schedule has one row
 * for it. Doing that in one pass would let a long event swallow the stream
 * belonging to the row after it: two classes of the same series run
 * back-to-back under nearly the same title, and the second one's recording
 * would be read as the first one's part two. After pass one it is already
 * spoken for.
 */
export async function withReplays(events: CalendarEvent[]): Promise<CalendarEvent[]> {
  if (events.length === 0) return events
  const index = await getReplayIndex()
  if (index.length === 0) return events

  const byTime = index.map((r) => ({ ...r, t: Date.parse(r.start) })).sort((a, b) => a.t - b.t)
  const used = new Set<string>()

  // Pass one — every event against every stream it could be, best pairing
  // first: strongest agreement between the schedule's name and the stream's
  // title, and among equals the nearer start.
  const pairs: { i: number; r: (typeof byTime)[number]; score: number; delta: number }[] = []
  events.forEach((e, i) => {
    if (e.isLive) return
    const t0 = Date.parse(e.dateISO)
    for (const r of byTime) {
      if (r.finished !== e.isPast) continue
      const delta = Math.abs(r.t - t0)
      if (delta > MATCH_WINDOW_MS) continue
      if (delta > CLOSE_ENOUGH_MS && !sharesAWord(e.series, r.title)) continue
      if (r.channel !== CHANNEL_ID && overlap(e.series, r.title) < PARTNER_TITLE_OVERLAP) continue
      pairs.push({ i, r, score: overlap(e.series, r.title), delta })
    }
  })
  pairs.sort((a, b) => (b.score - a.score) || (a.delta - b.delta))
  const claimed = new Map<number, (typeof byTime)[number]>()
  for (const p of pairs) {
    if (claimed.has(p.i) || used.has(p.r.id)) continue
    claimed.set(p.i, p.r)
    used.add(p.r.id)
  }
  const matched = events.map((e, i) => ({ e, best: claimed.get(i) ?? null }))

  // Pass two — the rest of the chain, for the events that have one.
  return matched.map(({ e, best }) => {
    if (!best) return e
    const parts = [best.id]
    let current = best
    // A dozen is far beyond anything we have broadcast, and stops a cycle.
    for (let i = 0; i < 12; i++) {
      const next = nextPart(current, byTime, used)
      if (!next) break
      used.add(next.id)
      parts.push(next.id)
      current = next
    }
    return parts.length > 1 ? { ...e, videoId: parts[0], videoParts: parts } : { ...e, videoId: parts[0] }
  })
}

type Timed = Replay & { t: number }

/** The stream that takes over where this one stopped, if there is one. */
function nextPart(current: Timed, byTime: Timed[], used: Set<string>): Timed | null {
  if (!current.end) return null
  const endedAt = Date.parse(current.end)
  if (!Number.isFinite(endedAt)) return null
  for (const r of byTime) {
    if (used.has(r.id) || !r.finished) continue
    // Parts of one broadcast go out on one channel.
    if (r.channel !== current.channel) continue
    // Starts at the moment the previous part ended — a minute of slack for a
    // stream whose recorded end runs just past the next one's start.
    if (r.t < endedAt - 60_000) continue
    if (r.t > endedAt + PART_GAP_MS) break // sorted by time: nothing later qualifies
    if (overlap(current.title, r.title) >= PART_TITLE_OVERLAP) return r
  }
  return null
}
