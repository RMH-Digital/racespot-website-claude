import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

/** @type {import('next').NextConfig} */

// Security headers — Traefik in front of us adds none of these (verified with
// curl -I on 2026-09-09), so the app sets them itself.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
]

const nextConfig = {
  // A stray package-lock.json in the home directory makes Next infer the wrong
  // workspace root and trace files from there. Pin it to this project.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  images: {
    // The optimizer is ON: we self-host on Coolify with `sharp` installed, so
    // every <Image> is resized to the rendered width and re-encoded on first
    // request, then cached. Source files in public/images are normalised to
    // ≤ 1920 px by scripts/optimize-images.mjs.
    //
    // WebP only — deliberately no AVIF. Measured on the production server
    // (2026-09-09): a cold AVIF encode took 1.6–2.9 s per image, WebP 0.16 s,
    // for ~10 % smaller files. The cache is wiped on every deploy, so cold
    // encodes are not rare; scripts/warm-image-cache.mjs pre-fills it at start.
    formats: ['image/webp'],
    // Photos are never displayed wider than this. Keep in sync with WIDTHS in
    // scripts/warm-image-cache.mjs.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — our photos never change in place
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      /**
       * Next's own prefetches, kept out of the index.
       *
       * The App Router appends `?_rsc=<hash>` when it fetches a route ahead of
       * a click. Googlebot renders the page, sees those requests and files
       * them as URLs of their own — 23 of them by 2026-09-22, 13.6 % of all
       * impressions and not one click in seven days. The hash changes with
       * every deploy, so the set grows forever.
       *
       * `noindex` on the response is what removes a URL that is already
       * indexed; a `Disallow` in robots.txt would only stop the next crawl and
       * leave what is in there. It has to live here rather than in the proxy:
       * Next strips `_rsc` from the request before middleware runs, so
       * `nextUrl.searchParams` and even the raw `request.url` no longer carry
       * it (measured 2026-09-22). The `has` condition in this config is
       * evaluated earlier, and does see it — on the 200 for `/en/events?_rsc=…`
       * as well as on the 301 that `/events?_rsc=…` gets.
       *
       * A page without the parameter is untouched, which is the whole point.
       */
      {
        source: '/:path*',
        has: [{ type: 'query', key: '_rsc' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ]
  },
}

export default nextConfig
