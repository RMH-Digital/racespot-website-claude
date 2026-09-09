import Script from 'next/script'

/**
 * Umami web analytics (self-hosted on Philip's Coolify instance).
 *
 * Renders nothing unless both public env vars are set, so local dev and
 * preview builds never report hits:
 *   NEXT_PUBLIC_UMAMI_SRC         e.g. https://stats.racespot.tv/script.js
 *   NEXT_PUBLIC_UMAMI_WEBSITE_ID  the UUID Umami shows under Settings → Websites
 *
 * Umami is cookieless and stores no personal data, which is why there is no
 * consent banner in front of it. Keep the privacy page's "Web Analytics"
 * section in sync if this ever changes.
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  if (!src || !websiteId) return null

  return (
    <Script
      src={src}
      data-website-id={websiteId}
      // Only count hits on the real domain — not on preview/staging hostnames.
      data-domains="racespot.tv,www.racespot.tv"
      strategy="afterInteractive"
    />
  )
}
