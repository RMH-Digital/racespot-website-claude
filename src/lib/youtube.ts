/**
 * YouTube integration for Racespot.tv (SERVER-ONLY)
 *
 * QUOTA OPTIMIZATION STRATEGY:
 *   1. RSS feed (0 units) for video data — includes title, thumbnail, views, date
 *   2. videos.list (1 unit) only when API available — adds duration, stats
 *   3. Scraping (0 units) for live stream pre-check — replaces search.list (100 units!)
 *   4. playlists.list (1 unit) cached for 24h
 *   5. Live stream details (1 unit) only when scraping confirms live
 *
 * For client-side imports (types, formatViewCount, etc.), use '@/lib/youtube-utils'.
 */

// Re-export types and utils so existing server imports still work
export type { YouTubeVideo, YouTubeLiveStream, YouTubePlaylist } from './youtube-utils'
export { formatViewCount, formatDate, formatDuration } from './youtube-utils'

import { unstable_cache } from 'next/cache'
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
const CACHE_LIVE = 60         // 1 min — live stream check (lightweight scrape)
const CACHE_LIVE_DETAILS = 60 // 1 min — live stream details (only when live)

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
    const res = await fetch(url, { next: { revalidate: CACHE_1H } })

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
      return [] // Caller (getLatestVideos/getCompletedBroadcasts) falls back to RSS
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
 * Fetch latest videos from the channel.
 * Cost: 0 units (RSS) + 1 unit (video details) = 1 unit total.
 * Fallback: RSS-only data when API quota is exceeded (no duration).
 * Cached for 1 hour.
 */
export async function getLatestVideos(maxResults = 6): Promise<YouTubeVideo[]> {
  if (!CHANNEL_ID) {
    console.warn('YouTube Channel ID not configured')
    return []
  }

  try {
    const rssVideos = await getRecentVideos()
    if (!rssVideos.length) return []

    const subset = rssVideos.slice(0, maxResults)
    const ids = subset.map((v) => v.id)

    // Try API for full details (duration, stats)
    const apiVideos = await getVideoDetails(ids, CACHE_1H)

    // If API returned data, use it; otherwise fall back to RSS
    if (apiVideos.length > 0) return apiVideos
    return subset.map(rssToYouTubeVideo)
  } catch (error) {
    console.error('YouTube latest videos error:', error)
    return []
  }
}

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

/**
 * Check if channel is currently live streaming and return ALL live streams.
 *
 * Four-tier approach for reliable multi-stream detection:
 *   Tier 1 (1 unit):   RSS + videos.list — check recent video IDs for liveBroadcastContent
 *                       Works from ANY server (no IP blocking), most reliable method.
 *   Tier 2 (0 units):  Scrape channel page for live indicator (fails on cloud IPs)
 *   Tier 3 (100 units): Search API to find ALL concurrent live streams
 *   Tier 4 (1 unit):   videos.list for details on found streams
 *
 * When offline: 1 unit (RSS check, cached 60s).
 * When live: 1-102 units depending on which tier detects it.
 */
export async function getLiveStreams(): Promise<YouTubeLiveStream[]> {
  if (!CHANNEL_ID) return []

  try {
    // ── Tier 1: RSS + videos.list (1 unit, works from any IP) ──
    // Get recent video IDs from free RSS feed, then check liveBroadcastContent
    const rssLiveStreams = await detectLiveViaRSS()
    if (rssLiveStreams.length > 0) {
      console.log(`[Live] Tier 1 (RSS): Found ${rssLiveStreams.length} live stream(s)`)
      return rssLiveStreams
    }

    // ── Tier 2: Free scrape check (0 units, blocked on some cloud IPs) ──
    const channelUrl = `https://www.youtube.com/channel/${CHANNEL_ID}/live`
    let scrapeFoundLive = false
    try {
      const scrapeRes = await fetch(channelUrl, {
        // Was `cache: 'no-store'`, which meant every single request to /live
        // downloaded YouTube's whole channel page — about a second of TTFB on
        // the common case, when nothing is live. One minute of cache matches
        // CACHE_LIVE elsewhere and costs nothing in practice: the client polls
        // /api/live-streams every 60s, so a stream going live still surfaces
        // within a minute either way.
        next: { revalidate: CACHE_LIVE },
        // And never let a slow YouTube hold the page hostage.
        signal: AbortSignal.timeout(4000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      })

      if (scrapeRes.ok) {
        const html = await scrapeRes.text()
        scrapeFoundLive = html.includes('"isLive":true') || html.includes('"style":"LIVE"')
      }
    } catch {
      // Scraping blocked — continue to next tier
    }

    if (!scrapeFoundLive) return []

    // Scraping says live but the upload list did not — the Search API, through
    // the same five-minute cache as the route's fallback (100 units a call).
    return await getLiveStreamsViaSearch()
  } catch (error) {
    console.error('YouTube live check error:', error)
    return []
  }
}

/**
 * Detect live streams via RSS feed + videos.list API.
 * Cost: 1 API unit (videos.list for up to 15 IDs).
 * This works from ANY server — no scraping, no IP blocking issues.
 */
async function detectLiveViaRSS(): Promise<YouTubeLiveStream[]> {
  if (!LIVE_API_KEY || !CHANNEL_ID) {
    console.warn('[Live] detectLiveViaRSS: missing LIVE_API_KEY or CHANNEL_ID')
    return []
  }

  try {
    // Step 1: Get recent video IDs — free RSS feed, uploads playlist when RSS is down
    const rssVideos = await getRecentVideos()
    console.log(`[Live] RSS feed returned ${rssVideos.length} videos: ${rssVideos.map(v => v.id).join(',')}`)
    if (rssVideos.length === 0) return []

    // Step 2: Check liveBroadcastContent via videos.list (1 unit for all IDs)
    // Uses LIVE_API_KEY — separate quota from main API key
    const ids = rssVideos.map((v) => v.id).join(',')
    const baseUrl = `${BASE_URL}/videos?part=snippet,liveStreamingDetails&id=${ids}`
    let res = await fetch(`${baseUrl}&key=${LIVE_API_KEY}`, { next: { revalidate: CACHE_LIVE } })

    // Fallback to main API key if live key quota is exhausted
    if (!res.ok && API_KEY && API_KEY !== LIVE_API_KEY) {
      console.warn(`[Live] LIVE_API_KEY failed (${res.status}), falling back to main API_KEY`)
      res = await fetch(`${baseUrl}&key=${API_KEY}`, { next: { revalidate: CACHE_LIVE } })
    }

    if (!res.ok) {
      console.warn(`[Live] RSS videos.list check failed: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    const items = data.items || []
    console.log(`[Live] videos.list returned ${items.length} items, broadcast states: ${items.map((i: { id: string; snippet: { liveBroadcastContent: string } }) => `${i.id}=${i.snippet.liveBroadcastContent}`).join(', ')}`)

    // Step 3: Filter to currently live streams
    const liveItems = items.filter(
      (item: { snippet: { liveBroadcastContent: string } }) =>
        item.snippet.liveBroadcastContent === 'live'
    )

    if (liveItems.length === 0) {
      console.log('[Live] No live streams found in RSS videos')
      return []
    }

    // Step 4: Map to YouTubeLiveStream format
    return liveItems.map((item: {
      id: string
      snippet: {
        title: string
        description: string
        thumbnails: { high?: { url: string }; medium?: { url: string } }
      }
      liveStreamingDetails?: { concurrentViewers?: string }
    }) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
      concurrentViewers: item.liveStreamingDetails?.concurrentViewers || '0',
    }))
  } catch (error) {
    console.error('[Live] RSS-based detection error:', error)
    return []
  }
}

/**
 * Fetch live stream details for given video IDs.
 * Cost: 1 API unit. Shared by multiple detection tiers.
 */
async function fetchLiveStreamDetails(videoIds: string[]): Promise<YouTubeLiveStream[]> {
  if (!LIVE_API_KEY || videoIds.length === 0) return []

  // Uses LIVE_API_KEY — separate quota from main API key
  const detailBaseUrl = `${BASE_URL}/videos?part=liveStreamingDetails,snippet&id=${videoIds.join(',')}`
  let detailRes = await fetch(`${detailBaseUrl}&key=${LIVE_API_KEY}`, { next: { revalidate: CACHE_LIVE_DETAILS } })

  // Fallback to main API key if live key quota is exhausted
  if (!detailRes.ok && API_KEY && API_KEY !== LIVE_API_KEY) {
    console.warn(`[Live] LIVE_API_KEY failed in fetchLiveStreamDetails (${detailRes.status}), falling back to main API_KEY`)
    detailRes = await fetch(`${detailBaseUrl}&key=${API_KEY}`, { next: { revalidate: CACHE_LIVE_DETAILS } })
  }

  if (!detailRes.ok) return []

  const detailData = await detailRes.json()
  const details = detailData.items || []

  return details
    .filter((detail: { snippet: { liveBroadcastContent: string; channelId: string } }) =>
      detail.snippet.liveBroadcastContent === 'live' && detail.snippet.channelId === CHANNEL_ID
    )
    .map((detail: {
      id: string
      snippet: {
        title: string
        description: string
        thumbnails: { high?: { url: string }; medium?: { url: string } }
      }
      liveStreamingDetails?: { concurrentViewers?: string }
    }) => ({
      id: detail.id,
      title: detail.snippet.title,
      description: detail.snippet.description,
      thumbnail: detail.snippet.thumbnails.high?.url || detail.snippet.thumbnails.medium?.url || '',
      concurrentViewers: detail.liveStreamingDetails?.concurrentViewers || '0',
    }))
}

/**
 * Convenience wrapper — returns first live stream or null.
 * Used by components that only need to know "is anything live?"
 */
export async function getLiveStream(): Promise<YouTubeLiveStream | null> {
  const streams = await getLiveStreams()
  return streams[0] ?? null
}

/**
 * Fallback: Use YouTube Search API to find ALL live streams.
 * Cost: 100 units — only call when primary detection fails but Sheets confirms live.
 * This handles edge cases where streams aren't in RSS yet.
 */
export const getLiveStreamsViaSearch = unstable_cache(
  searchLiveStreams,
  ['youtube-live-search'],
  // 100 units a call. Every client tab polls /api/live-streams each minute,
  // so without this a long "sheet says live, nothing found" window would
  // burn the daily quota in under two hours. Five minutes between searches
  // still finds a stream a few minutes after it goes live.
  { revalidate: 300 },
)

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
    // The live key has its own quota, and this call costs a hundred units of it.
    const searchBaseUrl = `${BASE_URL}/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&maxResults=10`
    const searchRes = await fetch(`${searchBaseUrl}&key=${LIVE_API_KEY}`, { next: { revalidate: CACHE_LIVE } })

    if (!searchRes.ok) {
      // Deliberately no fallback to the main key — see the note on this
      // function. Live detection loses its last resort for the rest of the
      // day; the site keeps its recordings.
      console.warn('[Live] Search skipped, live key refused it:', await apiError(searchRes))
      return []
    }

    const searchData = await searchRes.json()
    const searchItems = searchData.items || []

    if (searchItems.length === 0) {
      console.log('[Live] Search API found no live streams')
      return []
    }

    // Get live details for all found streams (1 unit)
    const videoIds = searchItems.map((item: { id: { videoId: string } }) => item.id.videoId)
    return await fetchLiveStreamDetails(videoIds)
  } catch (error) {
    console.error('[Live] Search API fallback error:', error)
    return []
  }
}

/**
 * @deprecated Use getLiveStreamsViaSearch() instead
 */
export async function getLiveStreamViaSearch(): Promise<YouTubeLiveStream | null> {
  const streams = await getLiveStreamsViaSearch()
  return streams[0] ?? null
}

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

// ─── Formatting utilities ────────────────────────────────────


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
