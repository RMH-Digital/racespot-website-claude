import type { MetadataRoute } from 'next'
import { ARTICLES } from '@/lib/articles'
import { articleLangs } from '@/lib/articleContent'
import { LANGS, type Lang } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/i18n/seo'

type Freq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

const STATIC_PAGES: { path: string; changeFrequency: Freq; priority: number }[] = [
  { path: '/',           changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/broadcasts', changeFrequency: 'daily',   priority: 0.9 },
  { path: '/calendar',   changeFrequency: 'daily',   priority: 0.9 },
  { path: '/live',       changeFrequency: 'always',  priority: 0.9 },
  { path: '/events',     changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/services',   changeFrequency: 'monthly', priority: 0.8 },
  { path: '/news',       changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/about',      changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact',    changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy',    changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/terms',      changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/imprint',    changeFrequency: 'yearly',  priority: 0.3 },
]

/** The `xhtml:link rel="alternate"` block for one page — same set as its hreflang tags. */
function languages(path: string, langs: readonly Lang[]) {
  const out: Record<string, string> = {}
  for (const l of langs) out[l] = absoluteUrl(l, path)
  out['x-default'] = absoluteUrl('en', path)
  return out
}

/**
 * One entry per page per language. An article is listed only in the
 * languages it was actually translated into (see articleLangs), so a
 * fallback-to-English page is never offered to the index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const page of STATIC_PAGES) {
    for (const lang of LANGS) {
      entries.push({
        url: absoluteUrl(lang, page.path),
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: languages(page.path, LANGS) },
      })
    }
  }

  for (const article of ARTICLES) {
    const path = `/news/${article.slug}`
    const langs = articleLangs(article)
    for (const lang of langs) {
      entries.push({
        url: absoluteUrl(lang, path),
        lastModified: new Date(article.date),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: languages(path, langs) },
      })
    }
  }

  return entries
}
