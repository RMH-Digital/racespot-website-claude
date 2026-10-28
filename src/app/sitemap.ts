import type { MetadataRoute } from 'next'
import { ARTICLES, type Article } from '@/lib/articles'
import { articleLangs } from '@/lib/articleContent'
import { LANGS, type Lang } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/i18n/seo'
import { LEGAL_LANGS } from '@/lib/i18n/legal/types'
import {
  INDEX_MIN,
  archiveYears,
  articlesInYear,
  liveCategories,
  articlesInCategory,
  resolveSeriesPage,
  seriesPageSlugs,
} from '@/lib/newsIndex'

type Freq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

/**
 * When this route is built. The sitemap is prerendered, so this is the deploy
 * time — the right answer for pages whose content comes from a live feed and
 * therefore changes at least as often as we ship.
 */
const BUILT_AT = new Date()

/**
 * Pages whose text is written by hand carry the date that text last changed,
 * **not** the deploy date. Google treats `lastmod` as a hint about content and
 * quietly stops trusting a sitemap where every URL claims to have changed
 * because someone adjusted a stylesheet.
 *
 * Bump the date here when you change what the page *says*.
 */
const CONTENT_UPDATED: Record<string, string> = {
  '/services': '2026-10-03',
  '/press':    '2026-10-03',
  '/about':    '2026-09-15',
  '/events':   '2026-09-15',
  '/contact':  '2026-10-03',
  '/privacy':  '2026-10-07',
  '/terms':    '2026-09-14',
  '/imprint':  '2026-09-14',
}

const STATIC_PAGES: { path: string; changeFrequency: Freq; priority: number; langs?: readonly Lang[] }[] = [
  { path: '/',           changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/broadcasts', changeFrequency: 'daily',   priority: 0.9 },
  { path: '/calendar',   changeFrequency: 'daily',   priority: 0.9 },
  { path: '/live',       changeFrequency: 'always',  priority: 0.9 },
  { path: '/events',     changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/services',   changeFrequency: 'monthly', priority: 0.8 },
  { path: '/news',       changeFrequency: 'daily',   priority: 0.8 },
  { path: '/news/series', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/about',      changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact',    changeFrequency: 'monthly', priority: 0.6 },
  { path: '/press',      changeFrequency: 'monthly', priority: 0.5 },
  // legal texts exist in en and de only (see src/lib/i18n/legal/types.ts)
  { path: '/privacy',    changeFrequency: 'yearly',  priority: 0.3, langs: LEGAL_LANGS },
  { path: '/terms',      changeFrequency: 'yearly',  priority: 0.3, langs: LEGAL_LANGS },
  { path: '/imprint',    changeFrequency: 'yearly',  priority: 0.3 },
]

/** The `xhtml:link rel="alternate"` block for one page — same set as its hreflang tags. */
function languages(path: string, langs: readonly Lang[]) {
  const out: Record<string, string> = {}
  for (const l of langs) out[l] = absoluteUrl(l, path)
  out['x-default'] = absoluteUrl('en', path)
  return out
}

/** The newest publish in a list — a list page changes when one of its articles does. */
function newest(articles: Article[]): Date {
  return new Date(articles.map((a) => a.updatedAt ?? a.publishedAt).sort().at(-1) ?? BUILT_AT)
}

/**
 * Section, series and archive pages that are worth indexing: those with at
 * least INDEX_MIN articles. Thinner ones exist (and are `noindex, follow`)
 * but are not offered. Page 2 onwards is found through the links on page 1.
 */
function newsListPages(): { path: string; articles: Article[] }[] {
  return [
    ...liveCategories().map(({ category }) => ({ path: `/news/category/${category.slug}`, articles: articlesInCategory(category.key) })),
    ...seriesPageSlugs().map((slug) => ({ path: `/news/series/${slug}`, articles: resolveSeriesPage(slug)?.articles ?? [] })),
    ...archiveYears().map((year) => ({ path: `/news/archive/${year}`, articles: articlesInYear(year) })),
  ].filter((p) => p.articles.length >= INDEX_MIN)
}

/**
 * One entry per page per language. An article is listed only in the
 * languages it was actually translated into (see articleLangs), so a
 * fallback-to-English page is never offered to the index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const page of STATIC_PAGES) {
    const langs = page.langs ?? LANGS
    const lastModified = CONTENT_UPDATED[page.path] ? new Date(CONTENT_UPDATED[page.path]) : BUILT_AT
    for (const lang of langs) {
      entries.push({
        url: absoluteUrl(lang, page.path),
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: languages(page.path, langs) },
      })
    }
  }

  for (const { path, articles } of newsListPages()) {
    for (const lang of LANGS) {
      entries.push({
        url: absoluteUrl(lang, path),
        lastModified: newest(articles),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: { languages: languages(path, LANGS) },
      })
    }
  }

  for (const article of ARTICLES) {
    const path = `/news/${article.slug}`
    const langs = articleLangs(article)
    for (const lang of langs) {
      entries.push({
        url: absoluteUrl(lang, path),
        // The last publish, not the byline day: a correction re-dates the entry for crawlers without moving it in the list.
        lastModified: new Date(article.updatedAt ?? article.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: languages(path, langs) },
      })
    }
  }

  return entries
}
