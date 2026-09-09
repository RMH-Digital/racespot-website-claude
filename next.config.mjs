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
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
