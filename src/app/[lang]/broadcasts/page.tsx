import type { Metadata } from 'next'
import Image from 'next/image'
import { getCompletedBroadcasts, getChannelPlaylists, type YouTubePlaylist } from '@/lib/youtube'
import { getSeriesTiers } from '@/lib/sheets'
import { VideoCard } from '@/components/ui/VideoCard'
import { BroadcastsClient, type PlaylistWithMeta } from '@/components/sections/BroadcastsClient'
import { T } from '@/components/ui/T'

/* Refresh video data every 5 minutes */
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Broadcasts',
  description: 'Portfolio of 400+ live sim racing broadcasts per year across all major platforms.',
  openGraph: {
    title: 'Broadcasts | Racespot.tv',
    description: 'Portfolio of 400+ live sim racing broadcasts per year across all major platforms.',
    images: [{ url: '/og-broadcasts.jpg', width: 1200, height: 630, alt: 'Racespot broadcast production' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-broadcasts.jpg'] },
}

/** Strip year patterns, season numbers, and normalize for tier matching */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b(20\d{2})\b/g, '')       // strip years like 2024, 2025, 2026
    .replace(/\bseason\s*\d+\b/gi, '')    // strip "Season 12"
    .replace(/\bs\d+\b/gi, '')            // strip "S12"
    .replace(/[^a-z0-9\s]/g, '')          // strip special chars
    .replace(/\s+/g, ' ')                 // collapse whitespace
    .trim()
}

/**
 * Extract a "series family" from a playlist title.
 * E.g. "Radical E-Cup 2025 Season 4" → "Radical E-Cup"
 *      "World GT Championship Season 18" → "World GT Championship"
 *      "Porsche Esports Carrera Cup GB 2026" → "Porsche Esports Carrera Cup GB"
 */
function extractFamily(title: string): string {
  return title
    .replace(/\b20\d{2}\b/g, '')          // strip years
    .replace(/\bseason\s*\d+\b/gi, '')    // strip "Season 12"
    .replace(/\bs\d+\b/gi, '')            // strip "S12"
    .replace(/\|/g, ' ')                  // pipes to spaces
    .replace(/\s+/g, ' ')                 // collapse whitespace
    .trim()
}

/** Match playlist to best tier from series data */
function matchPlaylistTier(
  playlist: YouTubePlaylist,
  seriesTiers: { series: string; tier: number }[],
): number {
  const normTitle = normalize(playlist.title)
  let bestTier = 99

  for (const { series, tier } of seriesTiers) {
    const normSeries = normalize(series)
    if (normTitle.includes(normSeries) || normSeries.includes(normTitle)) {
      if (tier < bestTier) bestTier = tier
    }
  }

  return bestTier
}

export default async function BroadcastsPage() {
  const [broadcasts, playlists, seriesTiers] = await Promise.all([
    getCompletedBroadcasts(6),
    getChannelPlaylists(50),
    getSeriesTiers(),
  ])

  // Assign tier + family to each playlist
  const enriched: PlaylistWithMeta[] = playlists.map((p) => ({
    ...p,
    tier: matchPlaylistTier(p, seriesTiers),
    family: extractFamily(p.title),
    isPrimary: false, // will be set below
  }))

  // Sort by tier (best first), then newest first within same tier
  enriched.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier
    // Newer published date first
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  // Mark the first (newest) playlist per family as primary
  const seenFamilies = new Set<string>()
  for (const p of enriched) {
    const key = p.family.toLowerCase()
    if (!seenFamilies.has(key)) {
      p.isPrimary = true
      seenFamilies.add(key)
    }
  }

  // Build unique family list (sorted by best tier of that family)
  const familyTierMap = new Map<string, number>()
  for (const p of enriched) {
    const key = p.family
    const existing = familyTierMap.get(key)
    if (existing === undefined || p.tier < existing) {
      familyTierMap.set(key, p.tier)
    }
  }
  const families = Array.from(familyTierMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([name]) => name)

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src="/images/setup/WhatsApp Image 2026-03-13 at 09.43.42.jpeg"
          alt="Racespot broadcast control room with multiple monitors"
          fill
          className="object-cover object-[center_35%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3"><T k="broadcastsPage.label" /></p>
            <h1 className="display-title"><T k="broadcastsPage.title" /></h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-16">
        <p className="text-rs-muted max-w-xl mb-16">
          <T k="broadcastsPage.intro" />
        </p>

        {/* Latest Broadcasts section */}
        <div className="mb-20">
          <div className="section-header">
            <div>
              <p className="section-label mb-2"><T k="broadcasts.recentCoverage" /></p>
              <h2 className="section-title"><T k="broadcasts.latestBroadcasts" /></h2>
            </div>
          </div>

          {broadcasts.length > 0 ? (
            <div className="card-grid card-grid--3">
              {broadcasts.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-rs-border rounded-rs">
              <p className="text-rs-muted text-sm">
                <T k="broadcasts.noBroadcasts" />
              </p>
            </div>
          )}
        </div>

        {/* Playlists section — hidden when YouTube API is unavailable */}
        {enriched.length > 0 && (
          <>
            <div className="divider mb-20" />
            <BroadcastsClient playlists={enriched} families={families} />
          </>
        )}
      </div>
    </div>
  )
}
