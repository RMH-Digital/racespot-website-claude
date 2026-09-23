/**
 * YouTube integration for Racespot.tv (SERVER-ONLY)
 *
 * What it costs, and why — the quota is 10,000 units a day per key:
 *
 *   - Recent videos: the channel's RSS feed, 0 units, kept five minutes. The
 *     uploads playlist (1 unit, an hour) only when the feed is down.
 *   - Details for the broadcasts sections: one videos.list, 1 unit, an hour.
 *   - Live detection (getLiveStreams): one videos.list over the recent ids on
 *     the live key — every minute while the schedule has a broadcast on or
 *     about to start, every five minutes while it has not. search.list, a
 *     hundred units, only in the first half hour of a scheduled broadcast
 *     whose stream is not in the uploads list yet, at most twice per
 *     broadcast. No scraping: the channel page said "live" for every
 *     *announced* stream, which is nearly always, and sent the search off
 *     every five minutes for nothing (2026-09-22).
 *   - Playlists: 1 unit a day. The events-page poster: 1 unit a day.
 *
 * The live answer is memoised in the process, so a hundred open tabs cost
 * what one does. The main key (YOUTUBE_API_KEY) carries the site, the live
 * key (YOUTUBE_LIVE_API_KEY) the detection; the search never falls back to
 * the main key.
 *
 * For client-side imports (types, formatViewCount, etc.), use '@/lib/youtube-utils'.
 */

// The types, re-exported for server code that imports from here. The
// formatting helpers live in youtube-utils only — client components need them
// without pulling in this server module.
export type { YouTubeVideo, YouTubeLiveStream, YouTubePlaylist } from './youtube-utils'

import type { YouTubeVideo, YouTubeLiveStream, YouTubePlaylist } from './youtube-utils'

const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

// Separate API key for live detection — uses its own quota so live detection
// works even when the main API key's quota is exhausted.
const LIVE_API_KEY = process.env.YOUTUBE_LIVE_API_KEY || API_KEY

// ─── Cache durations ────────────────────────────────────────
const CACHE_24H = 86400       // 24 hours — playlists, video details
const CACHE_1H = 3600         // 1 hour — latest videos, broadcasts
/**
 * Five minutes for the RSS feed. It costs nothing, YouTube itself caches it
 * for fifteen minutes (max-age=900), and it is where live detection gets its
 * ids from: at the old hour, a stream that was not announced ahead was
 * invisible to the cheap tier for up to an hour.
 */
const CACHE_RSS = 300

interface YouTubeVideoItem {
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: {
      medium?: { url: string }
      high?: { url: string }
    }
    publishedAt: string
    liveBroadcastContent: 'live' | 'upcoming' | 'none'
  }
  statistics: { viewCount: string; likeCount: string }
  contentDetails: { duration: string }
}

function mapVideoItem(item: YouTubeVideoItem): YouTubeVideo {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium?.url || '',
    thumbnailHigh: item.snippet.thumbnails.high?.url || '',
    publishedAt: item.snippet.publishedAt,
    viewCount: item.statistics?.viewCount || '0',
    likeCount: item.statistics?.likeCount || '0',
    duration: item.contentDetails?.duration || '',
    liveBroadcastContent: item.snippet.liveBroadcastContent,
  }
}

// ─── RSS Feed (0 quota units) ───────────────────────────────

interface RSSVideoData {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount: string
}

/**
 * Fetch latest videos from the channel's RSS feed.
 * Cost: 0 API units — uses YouTube's public Atom feed.
 * Returns up to 15 videos with basic data (YouTube RSS limit).
 */
async function getVideosFromRSS(): Promise<RSSVideoData[]> {
  if (!CHANNEL_ID) return []

  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
    const res = await fetch(url, { next: { revalidate: CACHE_RSS } })

    if (!res.ok) {
      console.error('YouTube RSS feed error:', res.status)
      return []
    }

    const xml = await res.text()
    const videos: RSSVideoData[] = []

    // Parse each <entry> block
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let entryMatch
    while ((entryMatch = entryRegex.exec(xml)) !== null) {
      const entry = entryMatch[1]

      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || ''
      const title = entry.match(/<media:title>([^<]*)<\/media:title>/)?.[1] || ''
      const description = entry.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || ''
      const thumbnail = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1] || ''
      const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1] || ''
      const viewCount = entry.match(/<media:statistics views="(\d+)"/)?.[1] || '0'

      if (id) {
        videos.push({ id, title, description, thumbnail, publishedAt, viewCount })
      }
    }

    return videos
  } catch (error) {
    console.error('YouTube RSS error:', error)
    return []
  }
}

/**
 * The channel's most recent uploads from the Data API — the fallback for the
 * RSS feed, which YouTube serves unreliably (it answered 500, then 404, for a
 * whole evening in September 2026 and took the broadcasts section down with
 * it). Cost: 1 unit, cached an hour. Same shape as the RSS rows so callers do
 * not care which source answered.
 */
async function getUploadsFromApi(maxResults = 15): Promise<RSSVideoData[]> {
  if (!CHANNEL_ID || !API_KEY) return []
  try {
    // The uploads playlist is the channel id with its "UC" swapped for "UU".
    const uploads = 'UU' + CHANNEL_ID.slice(2)
    const url = `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploads}&maxResults=${maxResults}&key=${API_KEY}`
    const res = await fetch(url, { next: { revalidate: CACHE_1H } })
    if (!res.ok) {
      console.error('YouTube uploads API error:', await apiError(res))
      return []
    }
    const data = await res.json()
    return (data.items || []).map((item: {
      snippet: {
        resourceId: { videoId: string }
        title: string
        description: string
        publishedAt: string
        thumbnails: { medium?: { url: string }; high?: { url: string } }
      }
    }) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || '',
      publishedAt: item.snippet.publishedAt,
      viewCount: '0',
    }))
  } catch (error) {
    console.error('YouTube uploads error:', error)
    return []
  }
}

/**
 * Recent videos from whichever source answers: the free RSS feed first, the
 * uploads playlist (1 unit) when it does not. Nothing downstream depends on
 * RSS alone any more.
 */
async function getRecentVideos(): Promise<RSSVideoData[]> {
  const rss = await getVideosFromRSS()
  if (rss.length > 0) return rss
  return getUploadsFromApi()
}

/**
 * Convert RSS data to full YouTubeVideo format (without duration/detailed stats).
 */
function rssToYouTubeVideo(rss: RSSVideoData): YouTubeVideo {
  return {
    id: rss.id,
    title: rss.title,
    description: rss.description,
    thumbnail: rss.thumbnail || `https://i.ytimg.com/vi/${rss.id}/mqdefault.jpg`,
    thumbnailHigh: `https://i.ytimg.com/vi/${rss.id}/hqdefault.jpg`,
    publishedAt: rss.publishedAt,
    viewCount: rss.viewCount,
    likeCount: '0',
    duration: '',
    liveBroadcastContent: 'none',
  }
}

// ─── Video Details (1 unit per call, up to 50 IDs) ──────────

/**
 * Fetch video details by IDs.
 * Cost: 1 unit per call (regardless of how many IDs, up to 50).
 */
async function getVideoDetails(videoIds: string[], revalidate = CACHE_24H): Promise<YouTubeVideo[]> {
  if (!videoIds.length || !API_KEY) return []

  try {
    const url = `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`
    const res = await fetch(url, { next: { revalidate } })

    if (!res.ok) {
      console.error('YouTube videos API error:', await apiError(res))
      return [] // Caller (getCompletedBroadcasts) falls back to RSS
    }

    const data = await res.json()
    if (!data.items?.length) return []

    return data.items.map(mapVideoItem)
  } catch (error) {
    console.error('YouTube video details error:', error)
    return []
  }
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Fetch recent broadcasts (videos > 10 min duration).
 * Cost: 0 units (RSS) + 1 unit (video details) = 1 unit total.
 * Fallback: When API unavailable, returns all RSS videos (can't filter by duration).
 * Cached for 1 hour.
 */
export async function getCompletedBroadcasts(maxResults = 6): Promise<YouTubeVideo[]> {
  if (!CHANNEL_ID) {
    console.warn('YouTube Channel ID not configured')
    return []
  }

  try {
    const rssVideos = await getRecentVideos()
    if (!rssVideos.length) return []

    // Try API for full details (needed for duration filtering)
    const apiVideos = await getVideoDetails(rssVideos.map((v) => v.id), CACHE_1H)

    if (apiVideos.length > 0) {
      // Filter for broadcast-length videos (> 10 minutes)
      const broadcasts = apiVideos.filter((v) => {
        const match = v.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
        const hours = parseInt(match?.[1] || '0', 10)
        const minutes = parseInt(match?.[2] || '0', 10)
        return hours > 0 || minutes >= 10
      })
      return broadcasts.slice(0, maxResults)
    }

    // Fallback: return RSS videos (can't filter by duration without API)
    return rssVideos.slice(0, maxResults).map(rssToYouTubeVideo)
  } catch (error) {
    console.error('YouTube completed broadcasts error:', error)
    return []
  }
}

// ─── Live detection ─────────────────────────────────────────

/**
 * The broadcast the Master Schedule says is on air or about to be, if any —
 * sheets.ts derives it with watchedBroadcast().
 *
 * `key` only has to be stable for one broadcast — the row id is. `start` is
 * the scheduled start, ms since epoch.
 */
export interface ScheduledBroadcast {
  key: string
  start: number
}

/** How often YouTube is asked while the schedule has a broadcast on or imminent… */
const LIVE_CHECK_ON_AIR_MS = 60_000
/** …and while it has not. An unannounced stream is still found within this. */
const LIVE_CHECK_IDLE_MS = 5 * 60_000
/**
 * The search window: from this long before a scheduled start until
 * SEARCH_AFTER_MS after it, a stream missing from the uploads list may be too
 * new to be listed, and the search is the only way to find it. Later, "not
 * listed" means "not on air" — streams end early far more often than they
 * start late.
 */
const SEARCH_BEFORE_MS = 5 * 60_000
const SEARCH_AFTER_MS = 30 * 60_000

let liveMemo: { at: number; streams: YouTubeLiveStream[] } | null = null
/** What the last check logged, so the log only speaks when it changes */
let lastLiveSummary: string | null = null
let liveCheck: Promise<YouTubeLiveStream[]> | null = null

/**
 * Every live stream on the channel right now.
 *
 * Two tiers, both keyed to the schedule the caller hands in:
 *
 *   1. videos.list over the recent upload ids (1 unit, live key). A stream
 *      appears in the uploads list the moment it exists — announced ahead as
 *      "upcoming", or when it goes live — so this finds nearly everything,
 *      the unannounced ones included, within the RSS feed's delay.
 *   2. search.list (100 units), only inside the search window of a scheduled
 *      broadcast whose stream tier 1 could not see, and under the budget in
 *      maySearch().
 *
 * The answer is kept in memory: a minute while a broadcast is on or about to
 * start, five minutes while nothing is. Every tab polls /api/live-streams once
 * a minute, and until 2026-09-22 each poll cost a unit and re-read a megabyte
 * of channel page from the fetch cache; now the process asks YouTube once and
 * answers everyone from the same result — about 500 units a day on the live
 * key against 1,440 before, and no more per visitor.
 */
export async function getLiveStreams(scheduled?: ScheduledBroadcast): Promise<YouTubeLiveStream[]> {
  if (!CHANNEL_ID) return []
  const now = Date.now()
  const ttl = scheduled ? LIVE_CHECK_ON_AIR_MS : LIVE_CHECK_IDLE_MS
  if (liveMemo && now - liveMemo.at < ttl) return liveMemo.streams
  // One check for everyone who asks while it runs.
  liveCheck ??= checkLive(scheduled).finally(() => { liveCheck = null })
  return liveCheck
}

async function checkLive(scheduled?: ScheduledBroadcast): Promise<YouTubeLiveStream[]> {
  try {
    const { live, announced } = await detectLiveViaUploads()
    let streams = live
    if (streams.length === 0 && scheduled) {
      const sinceStart = Date.now() - scheduled.start
      // A stream announced for this slot is already in the uploads list and
      // turns "live" there the moment it starts — tier 1 will see it on the
      // next check. Searching for it is a hundred units for nothing, which
      // is exactly the one search British F4 spent on 2026-09-23.
      const isAnnounced = announced.some((t) => Math.abs(t - scheduled.start) < SEARCH_AFTER_MS)
      if (!isAnnounced && sinceStart >= -SEARCH_BEFORE_MS && sinceStart < SEARCH_AFTER_MS) streams = await searchIfAllowed(scheduled)
    }
    liveMemo = { at: Date.now(), streams }
    return streams
  } catch (error) {
    console.error('YouTube live check error:', error)
    // The last answer beats none, and the next call retries.
    return liveMemo?.streams ?? []
  }
}

/**
 * Tier 1: the recent upload ids, then their broadcast state.
 * Cost: 1 unit (videos.list for up to 15 ids), live key.
 * Works from any server — no scraping, no IP blocking issues.
 *
 * `cache: 'no-store'` on purpose: getLiveStreams() is the cache, and a fetch
 * cache of its own underneath would have served a stale entry into the memo
 * and doubled the delay.
 */
async function detectLiveViaUploads(): Promise<{ live: YouTubeLiveStream[]; announced: number[] }> {
  const none = { live: [], announced: [] }
  if (!LIVE_API_KEY || !CHANNEL_ID) {
    console.warn('[Live] detectLiveViaUploads: missing LIVE_API_KEY or CHANNEL_ID')
    return none
  }

  try {
    const recent = await getRecentVideos()
    if (recent.length === 0) return none

    const ids = recent.map((v) => v.id).join(',')
    const baseUrl = `${BASE_URL}/videos?part=snippet,liveStreamingDetails&id=${ids}`
    let res = await fetch(`${baseUrl}&key=${LIVE_API_KEY}`, { cache: 'no-store' })

    // A unit on the main key when the live key is spent — cheap, and it keeps
    // the live page honest for the rest of the day.
    if (!res.ok && API_KEY && API_KEY !== LIVE_API_KEY) {
      console.warn(`[Live] live key refused videos.list (${await apiError(res)}), using the main key`)
      res = await fetch(`${baseUrl}&key=${API_KEY}`, { cache: 'no-store' })
    }

    if (!res.ok) {
      console.warn(`[Live] videos.list failed: ${await apiError(res)}`)
      return none
    }

    const items: LiveVideoItem[] = (await res.json()).items || []
    const live = items.filter((item) => item.snippet.liveBroadcastContent === 'live')
    // Once per change, not once per minute: the log said "0 live" 1,400
    // times a day. A new line means something went on or off air.
    const summary = live.map((i) => i.id).join(', ')
    if (summary !== lastLiveSummary) {
      console.log(`[Live] videos.list: ${items.length} ids, ${live.length} live${live.length ? ` (${summary})` : ''}`)
      lastLiveSummary = summary
    }
    // Scheduled start of every stream still waiting to go live, in ms.
    const announced = items
      .filter((item) => item.snippet.liveBroadcastContent === 'upcoming')
      .map((item) => Date.parse(item.liveStreamingDetails?.scheduledStartTime ?? ''))
      .filter(Number.isFinite)
    return { live: live.map(toLiveStream), announced }
  } catch (error) {
    console.error('[Live] uploads-based detection error:', error)
    return none
  }
}

interface LiveVideoItem {
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: { high?: { url: string }; medium?: { url: string } }
    liveBroadcastContent: string
    channelId?: string
  }
  liveStreamingDetails?: { concurrentViewers?: string; scheduledStartTime?: string }
}

function toLiveStream(item: LiveVideoItem): YouTubeLiveStream {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
    concurrentViewers: item.liveStreamingDetails?.concurrentViewers || '0',
  }
}

/**
 * Live details for the ids a search returned — the ones actually live and
 * actually ours. Cost: 1 unit, live key.
 */
async function fetchLiveStreamDetails(videoIds: string[]): Promise<YouTubeLiveStream[]> {
  if (!LIVE_API_KEY || videoIds.length === 0) return []

  const detailBaseUrl = `${BASE_URL}/videos?part=liveStreamingDetails,snippet&id=${videoIds.join(',')}`
  let detailRes = await fetch(`${detailBaseUrl}&key=${LIVE_API_KEY}`, { cache: 'no-store' })

  if (!detailRes.ok && API_KEY && API_KEY !== LIVE_API_KEY) {
    console.warn(`[Live] live key refused the details call (${await apiError(detailRes)}), using the main key`)
    detailRes = await fetch(`${detailBaseUrl}&key=${API_KEY}`, { cache: 'no-store' })
  }

  if (!detailRes.ok) return []

  const details: LiveVideoItem[] = (await detailRes.json()).items || []
  return details
    .filter((d) => d.snippet.liveBroadcastContent === 'live' && d.snippet.channelId === CHANNEL_ID)
    .map(toLiveStream)
}

/**
 * When a hundred-unit search is allowed to happen.
 *
 * Until 2026-09-22 the answer was "whenever the cheap tiers came up empty,
 * every five minutes, all day". Every visitor's tab polls /api/live-streams
 * once a minute and the site is quiet most of the day, so the search ran
 * against nothing: up to 288 calls, 28,800 units against a 10,000 quota. It
 * emptied the live key, the fallback then emptied the main key, and the whole
 * site lost its recordings. Jürgen's rule, and it is the right one: search
 * when the schedule actually says a broadcast is on.
 *
 * So: at most twice per scheduled broadcast, ten minutes apart — the first
 * call catches a stream that is already up, the second one a late start —
 * and never outside a broadcast's search window (see getLiveStreams). The
 * once-a-day search for unscheduled streams that this rule first allowed is
 * gone too: tier 1 finds those on its own, for free, within a few minutes,
 * and the channel-page scrape that was meant to trigger it said "live" for
 * every announced stream. Worst case about 200 units per broadcast, and on
 * a normal day none at all.
 *
 * The counters live in memory and reset on deploy. That is the right trade:
 * a deploy is rare, and losing the count costs at most one extra search.
 */
const MAX_SEARCHES_PER_BROADCAST = 2
const SEARCH_MIN_GAP_MS = 10 * 60 * 1000

const searchesSpent = new Map<string, { count: number; last: number }>()

function maySearch(scheduled: ScheduledBroadcast): boolean {
  const now = Date.now()
  const spent = searchesSpent.get(scheduled.key) ?? { count: 0, last: 0 }
  if (spent.count >= MAX_SEARCHES_PER_BROADCAST || now - spent.last < SEARCH_MIN_GAP_MS) return false
  searchesSpent.set(scheduled.key, { count: spent.count + 1, last: now })
  // One entry per broadcast, and broadcasts do not repeat their row id.
  if (searchesSpent.size > 50) for (const [k, v] of searchesSpent) if (now - v.last > 6 * 60 * 60 * 1000) searchesSpent.delete(k)
  return true
}

/** Tier 2, under the budget above. Empty when the budget says no. */
async function searchIfAllowed(scheduled: ScheduledBroadcast): Promise<YouTubeLiveStream[]> {
  if (!maySearch(scheduled)) {
    console.log('[Live] Search not spent — this broadcast has had its two')
    return []
  }
  return searchLiveStreams()
}

/**
 * What Google actually objected to.
 *
 * A bare status is not enough to act on: 403 is `quotaExceeded` when the day's
 * units are gone, `keyInvalid` when a key was rotated and `accessNotConfigured`
 * when the API was switched off in the project — three different problems, one
 * number. On 2026-09-22 the whole site lost its recordings for hours and the
 * log said "403" and nothing else.
 */
export async function apiError(res: Response): Promise<string> {
  try {
    const body = await res.clone().json()
    const first = body?.error?.errors?.[0]
    return `${res.status} ${first?.reason ?? ''} ${body?.error?.message ?? ''}`.trim()
  } catch {
    return String(res.status)
  }
}

/**
 * Live detection's last resort: one search.list, a hundred quota units.
 *
 * It runs on YOUTUBE_LIVE_API_KEY and, since 2026-09-22, on nothing else.
 * Until then it fell back to the main key when the live key was spent — and
 * the main key is what fetches the uploads, the playlists, the thumbnails and
 * the replay index for the whole site. A hundred units every five minutes
 * through a broadcast window emptied it, and the calendar lost every replay
 * and every bell while the search found nothing anyway. Detecting a live
 * stream is worth one unit through the uploads list, not the site's day.
 */
async function searchLiveStreams(): Promise<YouTubeLiveStream[]> {
  if (!LIVE_API_KEY || !CHANNEL_ID) return []

  try {
    const searchBaseUrl = `${BASE_URL}/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&maxResults=10`
    const searchRes = await fetch(`${searchBaseUrl}&key=${LIVE_API_KEY}`, { cache: 'no-store' })

    if (!searchRes.ok) {
      // Deliberately no fallback to the main key — see the note on this
      // function. Live detection loses its last resort for the rest of the
      // day; the site keeps its recordings.
      console.warn('[Live] Search skipped, live key refused it:', await apiError(searchRes))
      return []
    }

    const searchItems: { id: { videoId: string } }[] = (await searchRes.json()).items || []
    console.log(`[Live] Search found ${searchItems.length} live stream(s)`)
    if (searchItems.length === 0) return []

    // Get live details for all found streams (1 unit)
    return await fetchLiveStreamDetails(searchItems.map((item) => item.id.videoId))
  } catch (error) {
    console.error('[Live] Search API fallback error:', error)
    return []
  }
}

// ─── Playlists ──────────────────────────────────────────────

/**
 * Fetch all public playlists from the channel.
 * Cost: 1 unit. Cached for 24 hours.
 *
 * When the API fails (quota exceeded, network error, etc.) returns []
 * so the playlist section is hidden until the API recovers.
 */
export async function getChannelPlaylists(maxResults = 50): Promise<YouTubePlaylist[]> {
  if (!API_KEY || !CHANNEL_ID) {
    console.warn('YouTube API key or Channel ID not configured')
    return []
  }

  try {
    const url = `${BASE_URL}/playlists?part=snippet,contentDetails&channelId=${CHANNEL_ID}&maxResults=${maxResults}&key=${API_KEY}`
    const res = await fetch(url, { next: { revalidate: CACHE_24H } })

    if (!res.ok) {
      console.error('YouTube playlists API error:', await apiError(res))
      return []
    }

    const data = await res.json()
    if (!data.items?.length) return []

    return data.items
      .filter((item: { contentDetails: { itemCount: number } }) => item.contentDetails.itemCount > 0)
      .map((item: {
        id: string
        snippet: {
          title: string
          description: string
          thumbnails: { medium?: { url: string }; high?: { url: string } }
          publishedAt: string
        }
        contentDetails: { itemCount: number }
      }) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || '',
        thumbnailHigh: item.snippet.thumbnails.high?.url || '',
        itemCount: item.contentDetails.itemCount,
        publishedAt: item.snippet.publishedAt,
      })) as YouTubePlaylist[]
  } catch (error) {
    console.error('YouTube playlists error:', error)
    return []
  }
}

/**
 * The largest still YouTube actually has for a video. Not every video has a
 * `maxresdefault`; asking for it blind costs a 404 and a second request, which
 * is what made the events page's poster arrive late. One unit, cached a day.
 */
export async function getVideoThumbnail(videoId: string): Promise<string | null> {
  if (!API_KEY) return null
  try {
    const res = await fetch(`${BASE_URL}/videos?part=snippet&id=${videoId}&key=${API_KEY}`, { next: { revalidate: CACHE_24H } })
    if (!res.ok) return null
    const t = (await res.json())?.items?.[0]?.snippet?.thumbnails
    return t?.maxres?.url || t?.standard?.url || t?.high?.url || null
  } catch {
    return null
  }
}
