import { LOCALES, t, type Lang } from '@/lib/i18n'

/**
 * Client-safe YouTube types and utility functions.
 * These can be imported in both server and client components.
 */

// ─── Types ──────────────────────────────────────────────────

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  thumbnailHigh: string
  publishedAt: string
  viewCount: string
  likeCount: string
  duration: string
  liveBroadcastContent: 'live' | 'upcoming' | 'none'
}

export interface YouTubeLiveStream {
  id: string
  title: string
  description: string
  thumbnail: string
  concurrentViewers: string
}

export interface YouTubePlaylist {
  id: string
  title: string
  description: string
  thumbnail: string
  thumbnailHigh: string
  itemCount: number
  publishedAt: string
}

// ─── Formatting helpers ─────────────────────────────────────

/**
 * Format view count to human-readable string
 * e.g. 2100000 -> "2.1M", 85000 -> "85K", 1234 -> "1.2K"
 */
export function formatViewCount(count: string): string {
  const num = parseInt(count, 10)
  if (isNaN(num)) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1).replace(/\.0$/, '')}K`
  return num.toLocaleString()
}

/**
 * Format ISO date to relative/short format, in the page language:
 * "Today", "3 days ago", "2 weeks ago", then "Aug 2026".
 */
export function formatDate(isoDate: string, lang: Lang = 'en'): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  const locale = LOCALES[lang]

  if (diffDays === 0) return t(lang, 'common.today')
  if (diffDays === 1) return t(lang, 'common.yesterday')
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
    if (diffDays < 7) return rtf.format(-diffDays, 'day')
    if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), 'week')
  } catch {
    // very old runtimes without RelativeTimeFormat fall through to the month
  }

  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' })
}

/**
 * Parse ISO 8601 duration to human-readable
 * e.g. "PT1H30M15S" -> "1:30:15", "PT5M30S" -> "5:30"
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
