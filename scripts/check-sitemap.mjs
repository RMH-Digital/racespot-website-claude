#!/usr/bin/env node
/**
 * Every page under src/app/[lang]/ must be listed in the sitemap — or be
 * exempted here, on purpose, with a reason.
 *
 * The articles take care of themselves: sitemap.ts walks ARTICLES. The static
 * pages are a hand-kept array, and a hand-kept array drifts. This check is the
 * reason it does not: a new page without a sitemap entry fails the build
 * instead of quietly staying out of Google's index for a few months.
 *
 * Runs before eslint in `npm run build`.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const PAGES_DIR = 'src/app/[lang]'
const SITEMAP = 'src/app/sitemap.ts'

/**
 * Routes that exist but deliberately stay out of the sitemap. Add a reason —
 * the next person needs to know whether it was a decision or an oversight.
 */
const EXEMPT = new Map([
  // '/example': 'why this one does not belong in the index',
])

/** Every route under [lang] that renders a real, linkable page. */
function routes(dir = PAGES_DIR, prefix = '') {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    // Dynamic segments are either generated from data (news/[slug], listed via
    // ARTICLES) or catch-alls that must never be advertised ([...rest]).
    if (entry.name.startsWith('[')) continue
    const path = `${prefix}/${entry.name}`
    const full = join(dir, entry.name)
    if (readdirSync(full).includes('page.tsx')) found.push(path)
    found.push(...routes(full, path))
  }
  return found
}

/** The paths listed in sitemap.ts's STATIC_PAGES array. */
function listed() {
  const source = readFileSync(SITEMAP, 'utf8')
  const array = source.match(/const STATIC_PAGES[^=]*=\s*\[([\s\S]*?)\n\]/)
  if (!array) {
    fail(`Could not find the STATIC_PAGES array in ${SITEMAP}.`,
      'If it was renamed or restructured, update this check — do not delete it.')
  }
  return new Set([...array[1].matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]))
}

function fail(...lines) {
  console.error(`\n✗ ${lines[0]}`)
  for (const line of lines.slice(1)) console.error(`  ${line}`)
  console.error('')
  process.exit(1)
}

const inSitemap = listed()
const onDisk = ['/', ...routes()]

const missing = onDisk.filter((p) => !inSitemap.has(p) && !EXEMPT.has(p))
if (missing.length) {
  fail(`${missing.length} page(s) exist but are not in the sitemap:`,
    ...missing.map((p) => `• ${p}`),
    '',
    `Add them to STATIC_PAGES in ${SITEMAP} (with a changeFrequency and a`,
    'priority), and give each one a date in CONTENT_UPDATED if its text is',
    `written by hand. If a page belongs out of the index, list it in EXEMPT in`,
    'this file with the reason.')
}

const stale = [...inSitemap].filter((p) => !onDisk.includes(p))
if (stale.length) {
  fail(`${stale.length} sitemap entr(ies) point at pages that no longer exist:`,
    ...stale.map((p) => `• ${p}`),
    '',
    `Remove them from STATIC_PAGES in ${SITEMAP}.`)
}

console.log(`✓ sitemap covers all ${onDisk.length} pages`)
