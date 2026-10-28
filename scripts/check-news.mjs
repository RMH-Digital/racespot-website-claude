#!/usr/bin/env node
/**
 * The news data, checked before every build: content/news/taxonomy.json and
 * every entry in ARTICLES.
 *
 * The Press Tool merges articles into main without a human reading the diff,
 * and a push to main is a deploy. A broken entry should stop the build — the
 * live site keeps the previous version — rather than ship a page without a
 * section colour, a slug that shadows /news/page, or an article without its
 * AI notice (CLAUDE.md: every article, every language, no exceptions).
 *
 * Errors fail the build. Warnings are things the Press Tool does not yet do
 * on its own (series from the closed list, normalised tags) — they print, and
 * become errors once its adapter has caught up (docs/news-plan, step 2).
 *
 * Runs after check-sitemap in `npm run build`; alone: `npm run check-news`.
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const ARTICLES_FILE = 'src/lib/articles.ts'
const TAXONOMY_FILE = 'content/news/taxonomy.json'
const LANGS = ['de', 'es', 'pt', 'fr', 'it']
/** The word for "AI" in the notice, per language (docs/TODO.md 7p). */
const AI_WORD = { en: /\bAI\b/, de: /\bKI\b/, es: /\bIA\b/, pt: /\bIA\b/, fr: /\bIA\b/, it: /\bIA\b/ }

const errors = []
const warnings = []
const error = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

// ─── taxonomy ───────────────────────────────────────────────

const taxonomy = JSON.parse(readFileSync(TAXONOMY_FILE, 'utf8'))

function unique(list, field, where) {
  const seen = new Set()
  for (const item of list) {
    if (seen.has(item[field])) error(where, `duplicate ${field} "${item[field]}"`)
    seen.add(item[field])
  }
  return seen
}

const categoryKeys = unique(taxonomy.categories, 'key', TAXONOMY_FILE)
unique(taxonomy.categories, 'slug', TAXONOMY_FILE)
const familyIds = unique(taxonomy.families, 'id', TAXONOMY_FILE)
const seriesIds = unique(taxonomy.series, 'id', TAXONOMY_FILE)
const platformIds = unique(taxonomy.platforms, 'id', TAXONOMY_FILE)
const reserved = new Set(taxonomy.reservedSlugs)

// Families and series share /news/series/<id>, so one id may not be both.
for (const id of familyIds) if (seriesIds.has(id)) error(TAXONOMY_FILE, `"${id}" is both a family and a series id`)

for (const s of taxonomy.series) {
  const where = `${TAXONOMY_FILE} series "${s.id}"`
  if (s.family && !familyIds.has(s.family)) error(where, `unknown family "${s.family}"`)
  if (s.platform && !platformIds.has(s.platform)) error(where, `unknown platform "${s.platform}"`)
  if (!Array.isArray(s.aliases) || s.aliases.length === 0) error(where, 'needs at least one alias')
  for (const a of s.aliases ?? []) if (a !== a.toLowerCase()) error(where, `alias "${a}" must be lower case`)
  if (reserved.has(s.id)) error(where, 'id is a reserved slug')
}

// ─── articles ───────────────────────────────────────────────

/**
 * ARTICLES is TypeScript, and Node 20 (production) cannot import that. Strip
 * the types with the compiler the build already depends on, hand the one
 * runtime import (the taxonomy) in directly, and import the result.
 */
async function loadArticles() {
  let source = readFileSync(ARTICLES_FILE, 'utf8')
  const importLine = /^import \{ NEWS_CATEGORIES \} from '\.\/newsTaxonomy'$/m
  if (!importLine.test(source)) {
    fail(`${ARTICLES_FILE} no longer imports NEWS_CATEGORIES the way this check expects.`,
      'Update loadArticles() in scripts/check-news.mjs — do not delete the check.')
  }
  source = source.replace(importLine, `const NEWS_CATEGORIES = ${JSON.stringify(taxonomy.categories)}`)
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const dir = mkdtempSync(join(tmpdir(), 'check-news-'))
  try {
    const file = join(dir, 'articles.mjs')
    writeFileSync(file, js)
    return (await import(pathToFileURL(file).href)).ARTICLES
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DAY = /^\d{4}-\d{2}-\d{2}$/
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/
const normalizeTag = (t) =>
  t.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** Plain text of one block or string paragraph. */
const blockText = (b) => (typeof b === 'string' ? b : b.kind === 'p' ? b.text : '')

/** A paragraph that is one italic run and names AI, among the last three blocks. */
/** YouTube video ids are 11 characters of [A-Za-z0-9_-]. */
const VIDEO_ID = /^[\w-]{11}$/

/** The `broadcast` field (src/lib/articles.ts) — a bad id would be a player that never plays. */
function checkBroadcast(where, b) {
  if (typeof b !== 'object' || b === null) return error(where, 'broadcast is not an object')
  if (!VIDEO_ID.test(b.videoId ?? '')) error(where, `broadcast.videoId "${b.videoId}" is not a YouTube id`)
  if (b.videoParts !== undefined) {
    if (!Array.isArray(b.videoParts) || b.videoParts.some((id) => !VIDEO_ID.test(id))) error(where, 'broadcast.videoParts must be YouTube ids')
    else if (b.videoParts[0] !== b.videoId) error(where, 'broadcast.videoParts must start with broadcast.videoId')
  }
  if (!DAY.test(b.date ?? '')) error(where, `broadcast.date "${b.date}" is not YYYY-MM-DD`)
  if (typeof b.series !== 'string' || !b.series.trim()) error(where, 'broadcast.series is missing')
  if (b.eventId !== undefined && (typeof b.eventId !== 'string' || !b.eventId)) error(where, 'broadcast.eventId is empty')
  if (b.title !== undefined && (typeof b.title !== 'string' || !b.title.trim())) error(where, 'broadcast.title is empty')
}

function hasAiNotice(content, lang) {
  return content.slice(-3).some((b) => {
    const text = blockText(b).trim()
    return /^\*[^*].*\*$/s.test(text) && AI_WORD[lang].test(text)
  })
}

const ARTICLES = await loadArticles()
const slugs = new Set()

for (const a of ARTICLES) {
  const where = `article "${a.slug ?? '(no slug)'}"`

  if (typeof a.slug !== 'string' || !SLUG.test(a.slug)) error(where, 'slug must be lower-case words joined by hyphens')
  if (slugs.has(a.slug)) error(where, 'slug used twice')
  slugs.add(a.slug)
  if (reserved.has(a.slug)) error(where, `slug "${a.slug}" is reserved for a page under /news/`)

  if (!categoryKeys.has(a.category)) error(where, `unknown category "${a.category}" (known: ${[...categoryKeys].join(', ')})`)
  for (const field of ['title', 'excerpt', 'image', 'imageAlt', 'readTime']) {
    if (typeof a[field] !== 'string' || !a[field].trim()) error(where, `${field} is missing`)
  }
  if (!DAY.test(a.date ?? '')) error(where, `date "${a.date}" is not YYYY-MM-DD`)
  if (!ISO.test(a.publishedAt ?? '')) error(where, `publishedAt "${a.publishedAt}" is not ISO 8601 UTC`)
  if (a.updatedAt !== undefined && !ISO.test(a.updatedAt)) error(where, `updatedAt "${a.updatedAt}" is not ISO 8601 UTC`)
  if (a.pinnedUntil !== undefined && !ISO.test(a.pinnedUntil)) error(where, `pinnedUntil "${a.pinnedUntil}" is not ISO 8601 UTC`)
  if (a.format !== undefined && a.format !== 'feature') error(where, `format "${a.format}" is not "feature"`)
  if (a.broadcast !== undefined) checkBroadcast(where, a.broadcast)

  if (!Array.isArray(a.content) || a.content.length === 0) error(where, 'content is empty')
  else if (!hasAiNotice(a.content, 'en')) error(where, 'English text has no AI notice at the end')
  for (const lang of LANGS) {
    const tr = a.translations?.[lang]
    if (!tr) continue
    for (const field of ['title', 'excerpt', 'imageAlt']) {
      if (typeof tr[field] !== 'string' || !tr[field].trim()) error(where, `${lang}.${field} is missing`)
    }
    if (!Array.isArray(tr.content) || tr.content.length === 0) error(where, `${lang} content is empty`)
    else if (!hasAiNotice(tr.content, lang)) error(where, `${lang} text has no AI notice at the end`)
  }

  for (const id of a.series ?? []) {
    if (!seriesIds.has(id)) warn(where, `unknown series "${id}" — ignored on the site; add it to ${TAXONOMY_FILE} or drop it`)
  }
  for (const tag of a.tags ?? []) {
    if (normalizeTag(tag) !== tag) warn(where, `tag "${tag}" is not normalised (→ "${normalizeTag(tag)}")`)
  }
}

// ─── report ─────────────────────────────────────────────────

function fail(...lines) {
  console.error(`\n✗ ${lines[0]}`)
  for (const line of lines.slice(1)) console.error(`  ${line}`)
  console.error('')
  process.exit(1)
}

for (const w of warnings) console.warn(`⚠ ${w}`)
if (errors.length) fail(`News data: ${errors.length} problem${errors.length === 1 ? '' : 's'}`, ...errors)
console.log(`✓ News data: ${ARTICLES.length} articles, ${taxonomy.categories.length} categories, ${taxonomy.series.length} series${warnings.length ? `, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ''}`)
