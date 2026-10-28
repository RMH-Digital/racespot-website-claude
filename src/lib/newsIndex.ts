import type { Metadata } from 'next'
import { sortedArticles, CATEGORY_COLORS, type Article } from './articles'
import { localizeArticle } from './articleContent'
import { categoryLabel, formatDate, localePath, type Lang } from './i18n'
import { absoluteUrl, pageMetadata } from './i18n/seo'
import {
  NEWS_CATEGORIES,
  NEWS_SERIES,
  SERIES_FAMILIES,
  articleSeries,
  getCategory,
  getCategoryBySlug,
  getFamily,
  getSeries,
  type NewsCategory,
  type NewsSeries,
  type NewsSeriesFamily,
} from './newsTaxonomy'

/**
 * Which news pages exist, and what goes on them.
 *
 * **The section grows with its articles** (Jürgen, 2026-10-28): a category or
 * series with no article has no chip, no page and no sitemap entry — its URL
 * is a 404 until the first article arrives, and the next deploy creates it.
 * Pagination, the archive and family pages appear the same way, once there is
 * enough to fill them. Nothing here is a hand-kept list; it all follows from
 * ARTICLES and content/news/taxonomy.json.
 */

/** Articles per list page: on /news 3 lead + 6 cards + 15 lines. */
export const PAGE_SIZE = 24
/** A list page with fewer articles is `noindex, follow` and stays out of the sitemap — too thin to rank, still crawled. */
export const INDEX_MIN = 3
/** A family (Porsche Esports, VCO …) gets its own page only when this many of its series have articles; otherwise its one series page is the same list. */
const FAMILY_MIN_SERIES = 2

// ─── Membership ─────────────────────────────────────────────

export function articlesInCategory(key: string): Article[] {
  return sortedArticles().filter((a) => a.category === key)
}

export function articlesInSeries(ids: readonly string[]): Article[] {
  const want = new Set(ids)
  return sortedArticles().filter((a) => (a.series ?? []).some((id) => want.has(id)))
}

export interface LiveCategory {
  category: NewsCategory
  count: number
}

/** Sections that have articles, in taxonomy order. Only these are navigation. */
export function liveCategories(): LiveCategory[] {
  return NEWS_CATEGORIES.map((category) => ({ category, count: articlesInCategory(category.key).length })).filter(
    (c) => c.count > 0
  )
}

export interface LiveSeries {
  series: NewsSeries
  count: number
  /** `date` of its newest article — the rail sorts by it, so the active series lead. */
  latest: string
}

/** Series that have articles, most recently covered first. */
export function liveSeries(): LiveSeries[] {
  return NEWS_SERIES.flatMap((series) => {
    const list = articlesInSeries([series.id])
    return list.length ? [{ series, count: list.length, latest: list[0].date }] : []
  }).sort((a, b) => (a.latest < b.latest ? 1 : a.latest > b.latest ? -1 : 0))
}

export interface LiveFamily {
  family: NewsSeriesFamily
  members: NewsSeries[]
  count: number
}

export function liveFamilies(): LiveFamily[] {
  const live = liveSeries()
  return SERIES_FAMILIES.flatMap((family) => {
    const members = live.filter((l) => l.series.family === family.id).map((l) => l.series)
    if (members.length < FAMILY_MIN_SERIES) return []
    return [{ family, members, count: articlesInSeries(members.map((m) => m.id)).length }]
  })
}

/** What a /news/series/<slug> address is: one series, or a family of them. */
export type SeriesPage =
  | { kind: 'series'; series: NewsSeries; articles: Article[] }
  | { kind: 'family'; family: NewsSeriesFamily; members: NewsSeries[]; articles: Article[] }

export function resolveSeriesPage(slug: string): SeriesPage | undefined {
  const series = getSeries(slug)
  if (series) {
    const articles = articlesInSeries([series.id])
    return articles.length ? { kind: 'series', series, articles } : undefined
  }
  const family = liveFamilies().find((f) => f.family.id === slug)
  return family
    ? { kind: 'family', family: family.family, members: family.members, articles: articlesInSeries(family.members.map((m) => m.id)) }
    : undefined
}

/** Every /news/series/<slug> that exists. */
export function seriesPageSlugs(): string[] {
  return [...liveSeries().map((l) => l.series.id), ...liveFamilies().map((f) => f.family.id)]
}

export function resolveCategoryPage(slug: string): { category: NewsCategory; articles: Article[] } | undefined {
  const category = getCategoryBySlug(slug)
  if (!category) return undefined
  const articles = articlesInCategory(category.key)
  return articles.length ? { category, articles } : undefined
}

/** Years that have articles, newest first. */
export function archiveYears(): string[] {
  return [...new Set(sortedArticles().map((a) => a.date.slice(0, 4)))]
}

export function articlesInYear(year: string): Article[] {
  return sortedArticles().filter((a) => a.date.startsWith(`${year}-`))
}

// ─── Pages ──────────────────────────────────────────────────

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE))
}

/** Page `n` (1-based) of a list. */
export function pageOf<T>(list: T[], n: number): T[] {
  return list.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE)
}

/** `[{ n: '2' }, …]` for a paginated list; page 1 is the list's own address. */
export function pageParams(total: number): { n: string }[] {
  return Array.from({ length: pageCount(total) - 1 }, (_, i) => ({ n: String(i + 2) }))
}

/** `/news/page/3`-style param → page number, or null when it is not a page of this list. */
export function parsePage(n: string, total: number): number | null {
  if (!/^[2-9]\d*$|^[1-9]\d+$/.test(n)) return null
  const page = Number(n)
  return page >= 2 && page <= pageCount(total) ? page : null
}

/** Address of page `n` of the list at `base` (`/news`, `/news/category/esports` …). */
export function pagePath(base: string, n: number): string {
  return n <= 1 ? base : `${base}/page/${n}`
}

/**
 * The first page of /news: a pinned article first (by hand, `pinnedUntil`),
 * then the two after the lead taken from other sections where possible, so the
 * top of the page is not three results from one championship.
 */
export function frontPageOrder(list: Article[], now = Date.now()): Article[] {
  const pinned = list.filter((a) => a.pinnedUntil && Date.parse(a.pinnedUntil) > now)
  const rest = list.filter((a) => !pinned.includes(a))
  const ordered = [...pinned, ...rest]
  if (ordered.length < 3) return ordered
  const [lead, ...others] = ordered
  const picked: Article[] = []
  for (const a of others) {
    if (picked.length === 2) break
    if (a.category !== lead.category && !picked.some((p) => p.category === a.category)) picked.push(a)
  }
  for (const a of others) {
    if (picked.length === 2) break
    if (!picked.includes(a)) picked.push(a)
  }
  return [lead, ...picked, ...others.filter((a) => !picked.includes(a))]
}

// ─── Related ────────────────────────────────────────────────

/** The newest other articles of the article's first series. */
export function moreFromSeries(article: Article, limit = 3): { series: NewsSeries; articles: Article[] } | null {
  const series = articleSeries(article)[0]
  if (!series) return null
  const articles = articlesInSeries([series.id]).filter((a) => a.slug !== article.slug).slice(0, limit)
  return articles.length ? { series, articles } : null
}

/**
 * Articles worth reading next, scored: same series 5, same family 3, same
 * topic 2, same section 1, each shared tag 1 — minus a little per month of
 * age difference, so a fresh piece on the same beat beats an old one.
 */
export function relatedArticles(article: Article, limit = 4, exclude: readonly string[] = []): Article[] {
  const series = new Set(article.series ?? [])
  const families = new Set(articleSeries(article).flatMap((s) => (s.family ? [s.family] : [])))
  const topics = new Set((article.topics ?? []).map((t) => t.id))
  const tags = new Set(article.tags ?? [])
  const day = Date.parse(article.date)

  return sortedArticles()
    .filter((a) => a.slug !== article.slug && !exclude.includes(a.slug))
    .map((a) => {
      let score = 0
      if ((a.series ?? []).some((id) => series.has(id))) score += 5
      else if (articleSeries(a).some((s) => s.family && families.has(s.family))) score += 3
      if ((a.topics ?? []).some((t) => topics.has(t.id))) score += 2
      if (a.category === article.category) score += 1
      score += (a.tags ?? []).filter((t) => tags.has(t)).length
      score -= Math.abs(Date.parse(a.date) - day) / (30 * 864e5) * 0.25
      return { a, score }
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a)
}

// ─── What the cards get ─────────────────────────────────────

/** One article as the list components show it: localised, links resolved, no body. */
export interface NewsItem {
  slug: string
  href: string
  category: string
  categoryLabel: string
  categoryColor: string
  categoryHref: string | null
  series: { id: string; name: string; href: string }[]
  date: string
  dateLabel: string
  /** Same date, abbreviated month — for one-line lists. */
  dateShort: string
  image: string
  imageAlt: string
  title: string
  excerpt: string
  readTime: string
  /** The language the text is in — `en` when this language has no translation. */
  textLang: Lang
  /** True when that differs from the page language: the card marks it and sets `lang`. */
  fallback: boolean
}

export function toNewsItem(article: Article, lang: Lang): NewsItem {
  const loc = localizeArticle(article, lang)
  const category = getCategory(article.category)
  return {
    slug: article.slug,
    href: localePath(lang, `/news/${article.slug}`),
    category: article.category,
    categoryLabel: categoryLabel(lang, article.category),
    categoryColor: CATEGORY_COLORS[article.category] ?? 'text-rs-muted',
    categoryHref: category ? localePath(lang, `/news/category/${category.slug}`) : null,
    series: articleSeries(article).map((s) => ({ id: s.id, name: s.name, href: localePath(lang, `/news/series/${s.id}`) })),
    date: article.date,
    dateLabel: formatDate(lang, article.date),
    dateShort: formatDate(lang, article.date, { month: 'short' }),
    image: article.image,
    imageAlt: loc.imageAlt,
    title: loc.title,
    excerpt: loc.excerpt,
    readTime: loc.readTime,
    textLang: loc.lang,
    fallback: loc.lang !== lang,
  }
}

export function seriesDisplayName(slug: string): string {
  return getSeries(slug)?.name ?? getFamily(slug)?.name ?? slug
}

// ─── Metadata ───────────────────────────────────────────────

/**
 * Metadata for a news list page. Every language exists, so hreflang covers
 * all six; page 2 onwards keeps its own canonical (it lists different
 * articles) and says which page it is in the title. Thin lists are kept out of
 * the index but followed, so the articles on them are still found.
 */
export function newsListMetadata({
  lang,
  base,
  page = 1,
  title,
  description,
  count,
  pageLabel,
}: {
  lang: Lang
  base: string
  page?: number
  title: string
  description: string
  count: number
  /** "Page {n}" in this language */
  pageLabel: string
}): Metadata {
  const fullTitle = page > 1 ? `${title} – ${pageLabel.replace('{n}', String(page))}` : title
  const meta = pageMetadata({ lang, path: pagePath(base, page), title: fullTitle, description, image: '/og-news.jpg' })
  if (count < INDEX_MIN) meta.robots = { index: false, follow: true }
  meta.alternates = {
    ...meta.alternates,
    types: { 'application/rss+xml': absoluteUrl(lang, '/news/feed.xml') },
  }
  return meta
}
