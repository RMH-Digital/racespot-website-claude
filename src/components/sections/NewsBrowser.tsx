'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/**
 * The news index with a category filter.
 *
 * Only this part is a client component. The server localises every article and
 * hands over a slim, already-translated shape — deliberately without the
 * article bodies, which would otherwise be serialised into the page payload
 * for every article on the site.
 *
 * No filter selected → newest article as the feature, the rest as a list
 * (the layout the page has always had). A category selected → no feature, just
 * the matching articles, so the page never shows a feature that contradicts
 * the filter.
 */
export interface NewsItem {
  slug: string
  href: string
  category: string
  categoryLabel: string
  categoryColor: string
  date: string
  dateLabel: string
  image: string
  imageAlt: string
  title: string
  excerpt: string
  readTime: string
}

export interface NewsBrowserLabels {
  all: string
  filterLabel: string
  noResults: string
  showAll: string
  read: string
  readArticle: string
  /** "1 article" */
  countOne: string
  /** "{n} articles" */
  countMany: string
}

interface Props {
  items: NewsItem[]
  labels: NewsBrowserLabels
}

export function NewsBrowser({ items, labels }: Props) {
  const [active, setActive] = useState<string | null>(null)

  // Categories in the order they first appear, i.e. newest article first.
  const categories = useMemo(() => {
    const seen = new Map<string, { key: string; label: string; color: string }>()
    for (const i of items) {
      if (!seen.has(i.category)) {
        seen.set(i.category, { key: i.category, label: i.categoryLabel, color: i.categoryColor })
      }
    }
    return [...seen.values()]
  }, [items])

  const filtered = useMemo(
    () => (active ? items.filter((i) => i.category === active) : items),
    [items, active]
  )

  const showFeature = active === null && filtered.length > 0
  const feature = showFeature ? filtered[0] : null
  const list = showFeature ? filtered.slice(1) : filtered

  const count =
    filtered.length === 1
      ? labels.countOne
      : labels.countMany.replace('{n}', String(filtered.length))

  return (
    <>
      {/* Filter */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={labels.filterLabel}>
          <FilterChip active={active === null} onClick={() => setActive(null)}>
            {labels.all}
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.key} active={active === c.key} onClick={() => setActive(c.key)}>
              {c.label}
            </FilterChip>
          ))}
        </div>
        <p className="text-xs text-rs-muted mt-3" aria-live="polite">{count}</p>
      </div>

      {/* Featured — only without an active filter */}
      {feature && (
        <Link href={feature.href} className="group block mb-16">
          <div className="bg-rs-dark border border-rs-border hover:border-rs-yellow/40 transition-colors overflow-hidden">
            <div className="relative aspect-21/9 w-full overflow-hidden isolate">
              <Image
                src={feature.image}
                alt={feature.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-rs-black/80 via-rs-black/20 to-transparent" />
            </div>
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-mono ${feature.categoryColor}`}>{feature.categoryLabel}</span>
                <span className="text-rs-border">·</span>
                <time dateTime={feature.date} className="text-rs-muted text-xs">{feature.dateLabel}</time>
                <span className="text-rs-border">·</span>
                <span className="text-rs-muted text-xs">{feature.readTime} {labels.read}</span>
              </div>
              <h2 className="text-rs-white text-2xl md:text-3xl font-bold mb-4 group-hover:text-rs-yellow transition-colors leading-snug">
                {feature.title}
              </h2>
              <p className="text-rs-muted max-w-2xl leading-relaxed">{feature.excerpt}</p>
              <p className="mt-6 text-rs-yellow text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                {labels.readArticle} →
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* List */}
      {list.length > 0 && (
        <div className="space-y-px">
          {list.map((a) => (
            <Link
              key={a.slug}
              href={a.href}
              className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 py-6 border-b border-rs-border hover:bg-rs-dark px-4 -mx-4 transition-colors"
            >
              <div className="relative w-full md:w-48 aspect-video md:aspect-16/10 shrink-0 rounded-rs overflow-hidden isolate">
                <Image
                  src={a.image}
                  alt={a.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`text-xs font-mono ${a.categoryColor}`}>{a.categoryLabel}</span>
                  <span className="text-rs-border">·</span>
                  <time dateTime={a.date} className="text-rs-muted text-xs">{a.dateLabel}</time>
                </div>
                <h3 className="text-rs-white font-semibold group-hover:text-rs-yellow transition-colors mb-1">
                  {a.title}
                </h3>
                <p className="text-rs-muted text-sm line-clamp-2">{a.excerpt}</p>
              </div>
              <div className="text-rs-muted text-xs shrink-0 text-right hidden md:block">
                <p>{a.readTime} {labels.read}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Nothing matched — only reachable if a category exists but is emptied later */}
      {filtered.length === 0 && (
        <div className="border border-rs-border rounded-rs py-16 text-center">
          <p className="text-rs-muted text-sm mb-5">{labels.noResults}</p>
          <button onClick={() => setActive(null)} className="btn-outline btn-sm">
            {labels.showAll}
          </button>
        </div>
      )}
    </>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 rounded-rs text-[12px] font-display font-bold uppercase tracking-[0.08em] border transition-colors
        ${active
          ? 'bg-rs-yellow text-rs-black border-rs-yellow'
          : 'text-rs-muted border-rs-border hover:text-white hover:border-rs-muted'}`}
    >
      {children}
    </button>
  )
}
