import Script from 'next/script'

/**
 * Umami web analytics — self-hosted on Philip's Coolify instance at
 * stats.apps.racespot.tv. Cookieless, no personal data, so no consent banner;
 * the privacy policy (src/lib/i18n/legal/privacy.ts, "Web Analytics") names it.
 *
 * Script URL and website id are public values (they sit in the HTML of every
 * page), so they live here rather than in Coolify's environment. Two guards
 * keep dev and preview builds out of the statistics: the tag only renders in
 * production builds, and `data-domains` makes the script ignore any hostname
 * other than racespot.tv. Env vars can still override both values.
 */
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://stats.apps.racespot.tv/script.js'
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '0e77e402-57dd-4a86-ad05-334961f02de7'

export function Analytics() {
  if (process.env.NODE_ENV !== 'production') return null
  if (process.env.NEXT_PUBLIC_UMAMI_DISABLED === '1') return null

  return (
    <Script
      src={UMAMI_SRC}
      data-website-id={UMAMI_WEBSITE_ID}
      data-domains="racespot.tv,www.racespot.tv"
      strategy="afterInteractive"
    />
  )
}
