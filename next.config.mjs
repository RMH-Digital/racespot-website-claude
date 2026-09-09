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
    // every <Image> is resized to the rendered width and re-encoded as
    // AVIF/WebP on first request and cached. Source files in public/images stay
    // full-size (1–2 MB) but never reach a browser that way any more.
    formats: ['image/avif', 'image/webp'],
    // Gallery/hero photos are never displayed wider than this.
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
