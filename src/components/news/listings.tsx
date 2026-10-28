import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sortedArticles, type Article } from '@/lib/articles'
import { categoryLabel, formatDate, getT, localePath, t as translate, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { absoluteUrl } from '@/lib/i18n/seo'
import {
  PAGE_SIZE,
  archiveYears,
  articlesInYear,
  frontPageOrder,
  liveFamilies,
  liveSeries,
  newsListMetadata,
  pageCount,
  pageOf,
  resolveCategoryPage,
  resolveSeriesPage,
  toNewsItem,
} from '@/lib/newsIndex'
import { getFamily } from '@/lib/newsTaxonomy'
import { byTier, seriesOnSchedule } from '@/lib/seriesSchedule'
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/JsonLd'
import { NewsCard, NewsCompact, SeriesCard } from './cards'
import { NewsLead, NewsPageHeader, NewsRows, Pagination, SectionNav, type Crumb } from './nav'

/**
 * The news list pages, shared by page 1 and page n of each list. The route
 * files under app/[lang]/news/ only resolve params and call these.
 */

const newsCrumb = (lang: Lang): Crumb => ({ name: translate(lang, 'nav.news'), path: '/news' })

function JsonLd({ lang, crumbs, path, name, description, articles }: {
  lang: Lang
  crumbs: Crumb[]
  path: string
  name: string
  description: string
  articles: Article[]
}) {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Racespot.tv', url: absoluteUrl(lang, '/') },
          ...crumbs.map((c) => ({ name: c.name, url: c.path ? absoluteUrl(lang, c.path) : undefined })),
        ]}
      />
      <CollectionPageJsonLd
        lang={lang}
        url={absoluteUrl(lang, path)}
        name={name}
        description={description}
        items={articles.map((a) => absoluteUrl(lang, `/news/${a.slug}`))}
      />
    </>
  )
}

const pageCrumbs = (lang: Lang, crumbs: Crumb[], base: string, page: number): Crumb[] =>
  page > 1
    ? [...crumbs.slice(0, -1), { ...crumbs[crumbs.length - 1], path: base }, { name: translate(lang, 'news.pageN').replace('{n}', String(page)) }]
    : crumbs

// ─── /news ──────────────────────────────────────────────────

export function frontMetadata(lang: Lang, page: number): Metadata {
  return newsListMetadata({
    lang,
    base: '/news',
    page,
    title: translate(lang, 'meta.news.title'),
    description: translate(lang, 'meta.news.desc'),
    count: sortedArticles().length,
    pageLabel: translate(lang, 'news.pageN'),
  })
}

/** /news itself: lead, series, cards, short lines, and from page 2 on rows. */
export async function FrontPage({ lang, page }: { lang: Lang; page: number }) {
  const t = getT(lang)
  const all = sortedArticles()
  const pages = pageCount(all.length)
  if (page > pages) notFound()

  if (page > 1) {
    const articles = pageOf(all, page)
    const crumbs = pageCrumbs(lang, [newsCrumb(lang)], '/news', page)
    return (
      <div>
        <JsonLd lang={lang} crumbs={crumbs} path={`/news/page/${page}`} name={t('meta.news.title')} description={t('meta.news.desc')} articles={articles} />
        <NewsPageHeader lang={lang} crumbs={crumbs} title={t('meta.news.title')} label={t('news.pageN').replace('{n}', String(page))} />
        <div className="container-rs py-12">
          <SectionNav lang={lang} />
          <NewsRows items={articles.map((a) => toNewsItem(a, lang))} lang={lang} />
          <Pagination lang={lang} base="/news" page={page} pages={pages} />
        </div>
      </div>
    )
  }

  const first = frontPageOrder(all).slice(0, PAGE_SIZE)
  const items = first.map((a) => toNewsItem(a, lang))
  const lead = items.slice(0, 3)
  const cards = items.slice(3, 9)
  const lines = items.slice(9)
  // Broadcast series first, by tier from the Master Schedule; then the rest by latest article.
  const schedule = await seriesOnSchedule()
  const series = byTier(liveSeries(), schedule)
  const years = archiveYears()

  return (
    <div>
      <JsonLd lang={lang} crumbs={[{ name: t('nav.news') }]} path="/news" name={t('meta.news.title')} description={t('meta.news.desc')} articles={first} />
      {/* Hero banner */}
      <div className="relative h-[220px] md:h-[300px] overflow-hidden">
        <Image
          src="/images/gallery/Coanda_LMVS_IRL_LM24-177.jpg"
          alt={t('news.heroAlt')}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-8">
          <div>
            <p className="section-label mb-3">{t('news.latest')}</p>
            <h1 className="display-title">{t('meta.news.title')}</h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-12">
        <SectionNav lang={lang} />
        <NewsLead items={lead} lang={lang} />

        {/* Series rail — only once there are at least two series to choose between */}
        {series.length >= 2 && (
          <section className="mb-12" aria-labelledby="news-series">
            <div className="flex items-baseline justify-between mb-4">
              <h2 id="news-series" className="font-display font-bold uppercase text-white text-lg tracking-wide">{t('news.series')}</h2>
              <Link href={localePath(lang, '/news/series')} className="text-sm text-rs-yellow hover:underline">
                {t('news.allSeries')} →
              </Link>
            </div>
            <ul className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {series.slice(0, 8).map(({ series: s, count }) => (
                <li key={s.id} className="w-[70%] shrink-0 sm:w-auto">
                  <SeriesCard
                    lang={lang}
                    href={localePath(lang, `/news/series/${s.id}`)}
                    name={s.name}
                    family={s.family ? getFamily(s.family)?.name : undefined}
                    count={count}
                    racespot={schedule.has(s.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {cards.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {cards.map((item) => (
              <NewsCard key={item.slug} item={item} lang={lang} />
            ))}
          </div>
        )}

        {lines.length > 0 && (
          <section aria-labelledby="news-more">
            <h2 id="news-more" className="font-display font-bold uppercase text-white text-lg tracking-wide mb-2">{t('news.moreNews')}</h2>
            {lines.map((item) => (
              <NewsCompact key={item.slug} item={item} lang={lang} />
            ))}
          </section>
        )}

        <Pagination lang={lang} base="/news" page={1} pages={pages} />

        <p className="mt-12 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-rs-muted">
          {years.length >= 2 && (
            <span>
              {t('news.archive')}:{' '}
              {years.map((y, i) => (
                <span key={y}>
                  {i > 0 && ' · '}
                  <Link href={localePath(lang, `/news/archive/${y}`)} className="hover:text-rs-yellow">{y}</Link>
                </span>
              ))}
            </span>
          )}
          <a href={localePath(lang, '/news/feed.xml')} className="hover:text-rs-yellow">{t('news.rss')}</a>
        </p>
      </div>
    </div>
  )
}

// ─── /news/category/<slug> ─────────────────────────────────

export function categoryMetadata(lang: Lang, slug: string, page: number): Metadata {
  const found = resolveCategoryPage(slug)
  if (!found) return {}
  return newsListMetadata({
    lang,
    base: `/news/category/${slug}`,
    page,
    title: `${categoryLabel(lang, found.category.key)} – ${translate(lang, 'meta.news.title')}`,
    description: translate(lang, `category.${found.category.key}.desc` as TranslationKey),
    count: found.articles.length,
    pageLabel: translate(lang, 'news.pageN'),
  })
}

export function CategoryPage({ lang, slug, page }: { lang: Lang; slug: string; page: number }) {
  const found = resolveCategoryPage(slug)
  if (!found) notFound()
  const { category, articles } = found
  const pages = pageCount(articles.length)
  if (page > pages) notFound()

  const base = `/news/category/${slug}`
  const label = categoryLabel(lang, category.key)
  const description = translate(lang, `category.${category.key}.desc` as TranslationKey)
  const crumbs = pageCrumbs(lang, [newsCrumb(lang), { name: label }], base, page)
  const shown = pageOf(articles, page)
  const items = shown.map((a) => toNewsItem(a, lang))
  const lead = page === 1 ? items.slice(0, 3) : []
  const rows = page === 1 ? items.slice(3) : items

  return (
    <div>
      <JsonLd lang={lang} crumbs={crumbs} path={page > 1 ? `${base}/page/${page}` : base} name={label} description={description} articles={shown} />
      <NewsPageHeader lang={lang} crumbs={crumbs} title={label} description={description} count={articles.length} />
      <div className="container-rs py-12">
        <SectionNav lang={lang} active={category.key} />
        <NewsLead items={lead} lang={lang} />
        <NewsRows items={rows} lang={lang} />
        <Pagination lang={lang} base={base} page={page} pages={pages} />
      </div>
    </div>
  )
}

// ─── /news/series and /news/series/<slug> ──────────────────

export function seriesIndexMetadata(lang: Lang): Metadata {
  return newsListMetadata({
    lang,
    base: '/news/series',
    title: `${translate(lang, 'news.series')} – ${translate(lang, 'meta.news.title')}`,
    description: translate(lang, 'news.seriesIndexDesc'),
    count: liveSeries().length,
    pageLabel: translate(lang, 'news.pageN'),
  })
}

export async function SeriesIndexPage({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const schedule = await seriesOnSchedule()
  const series = byTier(liveSeries(), schedule)
  const families = liveFamilies()
  if (!series.length) notFound()
  const crumbs = [newsCrumb(lang), { name: t('news.series') }]
  return (
    <div>
      <BreadcrumbJsonLd
        crumbs={[{ name: 'Racespot.tv', url: absoluteUrl(lang, '/') }, { name: t('nav.news'), url: absoluteUrl(lang, '/news') }, { name: t('news.series') }]}
      />
      <NewsPageHeader lang={lang} crumbs={crumbs} title={t('news.series')} description={t('news.seriesIndexDesc')} />
      <div className="container-rs py-12">
        <SectionNav lang={lang} />
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {families.map(({ family, count, members }) => (
            <li key={family.id}>
              <SeriesCard
                lang={lang}
                href={localePath(lang, `/news/series/${family.id}`)}
                name={family.name}
                family={members.map((m) => m.name).join(' · ')}
                count={count}
              />
            </li>
          ))}
          {series.map(({ series: s, count }) => (
            <li key={s.id}>
              <SeriesCard
                lang={lang}
                href={localePath(lang, `/news/series/${s.id}`)}
                name={s.name}
                family={s.family ? getFamily(s.family)?.name : undefined}
                count={count}
                racespot={schedule.has(s.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function seriesMetadata(lang: Lang, slug: string, page: number): Metadata {
  const found = resolveSeriesPage(slug)
  if (!found) return {}
  const name = found.kind === 'series' ? found.series.name : found.family.name
  return newsListMetadata({
    lang,
    base: `/news/series/${slug}`,
    page,
    title: `${name} – ${translate(lang, 'meta.news.title')}`,
    description: translate(lang, 'news.seriesDesc').replace('{name}', name),
    count: found.articles.length,
    pageLabel: translate(lang, 'news.pageN'),
  })
}

export async function SeriesPage({ lang, slug, page }: { lang: Lang; slug: string; page: number }) {
  const t = getT(lang)
  const schedule = await seriesOnSchedule()
  const found = resolveSeriesPage(slug)
  if (!found) notFound()
  const pages = pageCount(found.articles.length)
  if (page > pages) notFound()

  const base = `/news/series/${slug}`
  const name = found.kind === 'series' ? found.series.name : found.family.name
  const description = t('news.seriesDesc').replace('{name}', name)
  // The family appears in the trail only when it has a page of its own.
  const familyId = found.kind === 'series' ? found.series.family : undefined
  const familyPage = familyId ? liveFamilies().find((f) => f.family.id === familyId) : undefined
  const crumbs = pageCrumbs(
    lang,
    [
      newsCrumb(lang),
      { name: t('news.series'), path: '/news/series' },
      ...(familyPage ? [{ name: familyPage.family.name, path: `/news/series/${familyPage.family.id}` }] : []),
      { name },
    ],
    base,
    page
  )
  const shown = pageOf(found.articles, page)
  // Other series of the same family that have articles — or, on a family page, its members.
  const siblings =
    found.kind === 'family'
      ? found.members
      : familyId
        ? liveSeries().map((l) => l.series).filter((s) => s.family === familyId && s.id !== found.series.id)
        : []
  const familyName = found.kind === 'family' ? found.family.name : familyId ? getFamily(familyId)?.name : undefined

  return (
    <div>
      <JsonLd lang={lang} crumbs={crumbs} path={page > 1 ? `${base}/page/${page}` : base} name={name} description={description} articles={shown} />
      <NewsPageHeader
        lang={lang}
        crumbs={crumbs}
        label={found.kind === 'series' ? familyName ?? t('news.series') : t('news.series')}
        title={name}
        description={description}
        count={found.articles.length}
      >
        {found.kind === 'series' && schedule.has(found.series.id) && (
          <p className="mt-4 inline-block rounded-rs border border-rs-yellow/60 px-3 py-1 text-xs text-rs-yellow">
            {t('news.producedByRacespot')}
          </p>
        )}
      </NewsPageHeader>
      <div className="container-rs py-12">
        <NewsRows items={shown.map((a) => toNewsItem(a, lang))} lang={lang} />
        <Pagination lang={lang} base={base} page={page} pages={pages} />

        {siblings.length > 0 && (
          <section className="mt-14" aria-labelledby="news-siblings">
            <h2 id="news-siblings" className="font-display font-bold uppercase text-white text-lg tracking-wide mb-4">
              {familyName ?? t('news.series')}
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {siblings.map((s) => (
                <li key={s.id}>
                  <SeriesCard
                    lang={lang}
                    href={localePath(lang, `/news/series/${s.id}`)}
                    name={s.name}
                    count={liveSeries().find((l) => l.series.id === s.id)?.count ?? 0}
                    racespot={schedule.has(s.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

// ─── /news/archive/<year> ──────────────────────────────────

export function archiveMetadata(lang: Lang, year: string): Metadata {
  return newsListMetadata({
    lang,
    base: `/news/archive/${year}`,
    title: `${translate(lang, 'news.archive')} ${year} – ${translate(lang, 'meta.news.title')}`,
    description: translate(lang, 'news.archiveDesc').replace('{year}', year),
    count: articlesInYear(year).length,
    pageLabel: translate(lang, 'news.pageN'),
  })
}

export function ArchivePage({ lang, year }: { lang: Lang; year: string }) {
  const t = getT(lang)
  const articles = articlesInYear(year)
  if (!articles.length) notFound()
  const crumbs = [newsCrumb(lang), { name: t('news.archive') }, { name: year }]
  const months = new Map<string, Article[]>()
  for (const a of articles) {
    const m = a.date.slice(0, 7)
    months.set(m, [...(months.get(m) ?? []), a])
  }
  const description = t('news.archiveDesc').replace('{year}', year)
  return (
    <div>
      <JsonLd lang={lang} crumbs={crumbs} path={`/news/archive/${year}`} name={`${t('news.archive')} ${year}`} description={description} articles={articles} />
      <NewsPageHeader lang={lang} crumbs={crumbs} label={t('news.archive')} title={year} description={description} count={articles.length}>
        <p className="mt-4 flex gap-3 text-sm">
          {archiveYears().map((y) =>
            y === year ? (
              <span key={y} className="text-rs-yellow" aria-current="page">{y}</span>
            ) : (
              <Link key={y} href={localePath(lang, `/news/archive/${y}`)} className="text-rs-muted hover:text-rs-yellow">{y}</Link>
            )
          )}
        </p>
      </NewsPageHeader>
      <div className="container-rs py-12 space-y-10">
        {[...months].map(([month, list]) => (
          <section key={month}>
            <h2 className="font-display font-bold uppercase text-white text-lg tracking-wide mb-2">
              {formatDate(lang, `${month}-01`, { day: undefined, month: 'long', year: 'numeric' })}
            </h2>
            {list.map((a) => (
              <NewsCompact key={a.slug} item={toNewsItem(a, lang)} lang={lang} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

