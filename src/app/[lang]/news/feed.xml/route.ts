import { sortedArticles } from '@/lib/articles'
import { localizeArticle } from '@/lib/articleContent'
import { DEFAULT_LANG, LANGS, LOCALES, categoryLabel, isLang, t } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/i18n/seo'

/**
 * RSS 2.0 per language: the newest 50 articles, headline and excerpt only.
 * An untranslated article appears in English, as it does on the list pages.
 * Built with the site — no third party, nothing read from the request.
 */
export const dynamic = 'force-static'
export const revalidate = 300

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLang(raw) ? raw : DEFAULT_LANG
  const articles = sortedArticles().slice(0, 50)
  const items = articles.map((a) => {
    const loc = localizeArticle(a, lang)
    const url = absoluteUrl(lang, `/news/${a.slug}`)
    return [
      '<item>',
      `<title>${esc(loc.title)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>`,
      `<category>${esc(categoryLabel(lang, a.category))}</category>`,
      `<description>${esc(loc.excerpt)}</description>`,
      '</item>',
    ].join('')
  })
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${esc(`${t(lang, 'meta.news.title')} | Racespot.tv`)}</title>`,
    `<link>${absoluteUrl(lang, '/news')}</link>`,
    `<atom:link href="${absoluteUrl(lang, '/news/feed.xml')}" rel="self" type="application/rss+xml"/>`,
    `<description>${esc(t(lang, 'news.rssDesc'))}</description>`,
    `<language>${LOCALES[lang].toLowerCase()}</language>`,
    ...(articles[0] ? [`<lastBuildDate>${new Date(articles[0].updatedAt ?? articles[0].publishedAt).toUTCString()}</lastBuildDate>`] : []),
    ...items,
    '</channel>',
    '</rss>',
  ].join('\n')
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })
}
