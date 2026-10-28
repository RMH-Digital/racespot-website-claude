import taxonomy from '../../content/news/taxonomy.json'
import type { Article } from './articles'

/**
 * The news taxonomy, read from `content/news/taxonomy.json` — the one list of
 * sections, series and platforms (docs/news-plan, step 1). The Press Tool is
 * to read the same file from its checkout, so the site and the pipeline can no
 * longer disagree about which values exist.
 *
 * Four levels, each with one job:
 * - **category** (`Article.category`) — the section, exactly one per article,
 *   navigation and its own page. Keys never change; the label readers see is
 *   `category.<key>` in translations.ts.
 * - **series** (`Article.series`) — championships and event series from a
 *   closed list, 0–n per article, its own page.
 * - **topics** — the Press Tool's editorial beats, a sub-filter inside a section.
 * - **tags** — free, normalised; platforms are derived from them.
 */

export interface NewsCategory {
  /** Stored on the article, in the Press Tool config and in `category.<key>` — never rename. */
  key: string
  /** English URL segment, identical in every language: /news/category/<slug> */
  slug: string
  /** Tailwind text colour for the section label. */
  color: string
  /** Same colour as a hex value, for the Press Tool's review preview. */
  hex: string
  /** Press Tool topics that publish under this section. */
  topics: string[]
}

export interface NewsSeriesFamily {
  id: string
  name: string
}

export interface NewsSeries {
  /** URL segment and the value stored in `Article.series` — never rename. */
  id: string
  /** Proper name, the same in every language. */
  name: string
  family?: string
  platform?: string
  /** An event series (expo, summit) rather than a championship. */
  kind?: 'event'
  /** RaceSpot produces the broadcast. */
  racespot: boolean
  /** Lower-case phrases that identify the series in a text. Specific, never a bare brand. */
  aliases: string[]
  /** How the Master Schedule starts this series' name (column K). */
  calendar: string[]
}

export interface NewsPlatform {
  id: string
  name: string
  /** Normalised tags that mean this platform. */
  tags: string[]
}

export const NEWS_CATEGORIES: readonly NewsCategory[] = taxonomy.categories
export const SERIES_FAMILIES: readonly NewsSeriesFamily[] = taxonomy.families
export const NEWS_SERIES: readonly NewsSeries[] = taxonomy.series as NewsSeries[]
export const NEWS_PLATFORMS: readonly NewsPlatform[] = taxonomy.platforms
/** Segments under /news/ that are pages, not articles. No slug may be one of them. */
export const RESERVED_SLUGS: readonly string[] = taxonomy.reservedSlugs

const categoryByKey = new Map(NEWS_CATEGORIES.map((c) => [c.key, c]))
const categoryBySlug = new Map(NEWS_CATEGORIES.map((c) => [c.slug, c]))
const seriesById = new Map(NEWS_SERIES.map((s) => [s.id, s]))
const familyById = new Map(SERIES_FAMILIES.map((f) => [f.id, f]))

export function getCategory(key: string): NewsCategory | undefined {
  return categoryByKey.get(key)
}

export function getCategoryBySlug(slug: string): NewsCategory | undefined {
  return categoryBySlug.get(slug)
}

export function getSeries(id: string): NewsSeries | undefined {
  return seriesById.get(id)
}

export function getFamily(id: string): NewsSeriesFamily | undefined {
  return familyById.get(id)
}

/** Series of one family, in list order. */
export function seriesInFamily(familyId: string): NewsSeries[] {
  return NEWS_SERIES.filter((s) => s.family === familyId)
}

/**
 * The article's series that the taxonomy knows. An unknown id is skipped, not
 * shown: it gets no chip and no page (the build check warns about it).
 */
export function articleSeries(article: Pick<Article, 'series'>): NewsSeries[] {
  return (article.series ?? []).flatMap((id) => seriesById.get(id) ?? [])
}

/**
 * The spelling every tag is stored in: lower case, words joined by hyphens,
 * nothing but letters, digits and hyphens. "MOZA Racing" → "moza-racing".
 */
export function normalizeTag(tag: string): string {
  return tag
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Platforms the article is about, derived from its tags. */
export function articlePlatforms(article: Pick<Article, 'tags'>): NewsPlatform[] {
  const tags = new Set((article.tags ?? []).map(normalizeTag))
  return NEWS_PLATFORMS.filter((p) => p.tags.some((t) => tags.has(t)))
}
