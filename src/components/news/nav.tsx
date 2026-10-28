import Link from 'next/link'
import { getT, categoryLabel, localePath, type Lang } from '@/lib/i18n'
import { liveCategories, pagePath, type NewsItem } from '@/lib/newsIndex'
import { NewsCard, NewsHero, NewsRow } from './cards'

export interface Crumb {
  name: string
  /** Language-free path; omit on the current page. */
  path?: string
}

/** The visible trail. The same crumbs feed `BreadcrumbJsonLd`. */
export function Breadcrumbs({ lang, crumbs }: { lang: Lang; crumbs: Crumb[] }) {
  const t = getT(lang)
  return (
    <nav aria-label={t('news.breadcrumb')} className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-rs-muted">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">›</span>}
            {c.path ? (
              <Link href={localePath(lang, c.path)} className="hover:text-rs-yellow transition-colors">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-rs-white/80">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * The sections as links — only those with articles (liveCategories), so a
 * new section appears here with its first article and not before.
 */
export function SectionNav({ lang, active }: { lang: Lang; active?: string }) {
  const t = getT(lang)
  const chip = (on: boolean) =>
    `shrink-0 px-4 py-2 rounded-rs text-[12px] font-display font-bold uppercase tracking-[0.08em] border transition-colors whitespace-nowrap ${
      on ? 'bg-rs-yellow text-rs-black border-rs-yellow' : 'text-rs-muted border-rs-border hover:text-white hover:border-rs-muted'
    }`
  return (
    <nav aria-label={t('news.sections')} className="mb-10 -mx-4 px-4 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex sm:flex-wrap gap-2">
        <li>
          <Link href={localePath(lang, '/news')} className={chip(!active)} aria-current={!active ? 'page' : undefined}>
            {t('news.filterAll')}
          </Link>
        </li>
        {liveCategories().map(({ category }) => (
          <li key={category.key}>
            <Link
              href={localePath(lang, `/news/category/${category.slug}`)}
              className={chip(active === category.key)}
              aria-current={active === category.key ? 'page' : undefined}
            >
              {categoryLabel(lang, category.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Head of a section, series or archive page. */
export function NewsPageHeader({
  lang,
  crumbs,
  label,
  title,
  description,
  count,
  children,
}: {
  lang: Lang
  crumbs: Crumb[]
  label?: string
  title: string
  description?: string
  count?: number
  children?: React.ReactNode
}) {
  const t = getT(lang)
  return (
    <header className="border-b border-rs-border bg-linear-to-b from-rs-dark to-rs-black">
      <div className="container-rs pt-10 md:pt-14 pb-10">
        <Breadcrumbs lang={lang} crumbs={crumbs} />
        {label && <p className="section-label mb-3">{label}</p>}
        <h1 className="display-title">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-rs-muted leading-relaxed">{description}</p>}
        {count !== undefined && (
          <p className="mt-3 text-xs text-rs-muted">
            {count === 1 ? t('news.countOne') : t('news.countMany').replace('{n}', String(count))}
          </p>
        )}
        {children}
      </div>
    </header>
  )
}

/** Lead story with up to two next to it (stacked on mobile). Adapts to one or two articles. */
export function NewsLead({ items, lang }: { items: NewsItem[]; lang: Lang }) {
  const [lead, ...side] = items
  if (!lead) return null
  if (side.length === 0) return <div className="mb-12"><NewsHero item={lead} lang={lang} priority /></div>
  return (
    <div className="grid lg:grid-cols-3 gap-5 mb-12">
      <div className="lg:col-span-2">
        <NewsHero item={lead} lang={lang} priority />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-5">
        {side.map((item) => (
          <NewsCard key={item.slug} item={item} lang={lang} excerpt={false} />
        ))}
      </div>
    </div>
  )
}

export function NewsRows({ items, lang }: { items: NewsItem[]; lang: Lang }) {
  if (!items.length) return null
  return (
    <div>
      {items.map((item) => (
        <NewsRow key={item.slug} item={item} lang={lang} />
      ))}
    </div>
  )
}

/**
 * Newer / numbers / older. Rendered only when there is more than one page —
 * a section with eleven articles shows no pagination at all.
 */
export function Pagination({ lang, base, page, pages }: { lang: Lang; base: string; page: number; pages: number }) {
  if (pages <= 1) return null
  const t = getT(lang)
  const href = (n: number) => localePath(lang, pagePath(base, n))
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  )
  const box = 'min-w-9 h-9 px-2.5 inline-flex items-center justify-center rounded-rs border text-sm transition-colors'
  return (
    <nav aria-label={t('news.pagination')} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={`${box} border-rs-border text-rs-muted hover:text-white hover:border-rs-muted`}>
          ← {t('news.newer')}
        </Link>
      )}
      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="text-rs-muted" aria-hidden="true">…</span>}
          {n === page ? (
            <span aria-current="page" className={`${box} border-rs-yellow text-rs-yellow`}>{n}</span>
          ) : (
            <Link href={href(n)} className={`${box} border-rs-border text-rs-muted hover:text-white hover:border-rs-muted`}>
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} rel="next" className={`${box} border-rs-border text-rs-muted hover:text-white hover:border-rs-muted`}>
          {t('news.older')} →
        </Link>
      )}
    </nav>
  )
}
