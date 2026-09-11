#!/usr/bin/env node
/**
 * Warms next/image's on-disk cache after a (re)start.
 *
 * The optimizer encodes each <image, width> pair on its first request and
 * caches it under .next/cache/images. That cache lives inside the container,
 * so every deploy starts cold — and a cold WebP encode of a 1920-px photo
 * costs 100–200 ms on the shared server (AVIF was 1.5–3 s, which is why it is
 * switched off). This script requests every variant a page can ask for, once,
 * right after `next start` is reachable, so no visitor ever pays that cost.
 *
 * Runs with concurrency 2 to stay polite to the other apps on the box.
 * Best effort: any failure is logged and ignored.
 *
 *   BASE=http://127.0.0.1:3000 node scripts/warm-image-cache.mjs
 */
import { readdir } from 'node:fs/promises'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// CJS entry on purpose: Next's standalone output traces only sharp's CommonJS
// files, so `import sharp from 'sharp'` fails inside the Docker image.
const sharp = createRequire(import.meta.url)('sharp')

const BASE = process.env.BASE || `http://127.0.0.1:${process.env.PORT || 3000}`
const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url))
const ROOT = join(PUBLIC, 'images')
// Must match images.deviceSizes in next.config.mjs (the widths next/image emits in srcset).
const WIDTHS = [640, 750, 828, 1080, 1200, 1920]
const CONCURRENCY = 2
const SKIP_DIRS = new Set(['logos', 'partners']) // small PNGs, rendered via <img> or tiny

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) yield* walk(p) }
    else if (/^\.(jpe?g|png|webp)$/i.test(extname(e.name))) yield p
  }
}

async function variants() {
  const list = []
  for await (const file of walk(ROOT)) {
    let width = Infinity
    try { width = (await sharp(file).metadata()).width ?? Infinity } catch {}
    const url = '/' + relative(PUBLIC, file).split('/').map(encodeURIComponent).join('/')
    // Only widths the optimizer would actually produce (it never upscales past the source).
    const ws = WIDTHS.filter((w) => w <= width)
    if (ws.length === 0 && WIDTHS.length) ws.push(WIDTHS[0])
    for (const w of ws) list.push(`${BASE}/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`)
  }
  return list
}

async function waitForServer(ms = 90_000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    try { const r = await fetch(`${BASE}/robots.txt`); if (r.ok) return true } catch {}
    await new Promise((r) => setTimeout(r, 1000))
  }
  return false
}

async function main() {
  if (!(await waitForServer())) { console.log('[warm] server not reachable, giving up'); return }
  const urls = await variants()
  const t0 = Date.now()
  let ok = 0, fail = 0, i = 0
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < urls.length) {
      const u = urls[i++]
      try {
        const r = await fetch(u, { headers: { Accept: 'image/webp,*/*' } })
        r.ok ? ok++ : fail++
        await r.arrayBuffer()
      } catch { fail++ }
    }
  }))
  console.log(`[warm] ${ok} variants cached, ${fail} failed, ${((Date.now() - t0) / 1000).toFixed(0)}s`)
}

main().catch((e) => console.log('[warm] error:', e?.message || e))
