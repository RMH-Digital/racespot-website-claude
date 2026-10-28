import Image from 'next/image'
import Link from 'next/link'
import { getT, type Lang } from '@/lib/i18n'
import type { NewsItem } from '@/lib/newsIndex'

/**
 * The preview formats of the news section (docs/news-plan, section 3). Every
 * list — /news, sections, series, archive, the "more" blocks under an article
 * — is built from these, so a change of style happens in one place.
 *
 * All server components: the cards get an already-localised `NewsItem`, never
 * an article body.
 */

/** Section · first series · date (· reading time). Plain text, the whole card is the link. */
export function NewsMeta({ item, lang, readTime = false, className = '' }: { item: NewsItem; lang: Lang; readTime?: boolean; className?: string }) {
  const t = getT(lang)
  const series = item.series[0]
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${className}`}>
      <span className={`font-mono ${item.categoryColor}`}>{item.categoryLabel}</span>
      {series && (
        <>
          <span className="text-rs-muted" aria-hidden="true">·</span>
          <span className="text-rs-white/70">{series.name}</span>
        </>
      )}
      <span className="text-rs-muted" aria-hidden="true">·</span>
      <time dateTime={item.date} className="text-rs-muted">{item.dateLabel}</time>
      {readTime && (
        <>
          <span className="text-rs-muted" aria-hidden="true">·</span>
          <span className="text-rs-muted">{item.readTime} {t('news.read')}</span>
        </>
      )}
      {item.fallback && (
        <span className="ml-1 rounded-xs border border-rs-border px-1.5 py-px font-mono text-[10px] uppercase text-rs-muted" title={t('news.inEnglishOnly')}>
          EN<span className="sr-only"> – {t('news.englishOnly')}</span>
        </span>
      )}
    </div>
  )
}

/** Headline in the language its text is in — `lang="en"` on a fallback. */
function Title({ item, as: As = 'h3', className }: { item: NewsItem; as?: 'h2' | 'h3'; className: string }) {
  return (
    <As className={className} lang={item.fallback ? item.textLang : undefined}>
      {item.title}
    </As>
  )
}

/** The lead story: wide image, big headline, teaser. */
export function NewsHero({ item, lang, priority = false }: { item: NewsItem; lang: Lang; priority?: boolean }) {
  const t = getT(lang)
  return (
    <Link href={item.href} className="card-dark group block overflow-hidden h-full">
      <div className="relative aspect-video md:aspect-2/1 w-full overflow-hidden isolate">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-rs-black/70 via-rs-black/10 to-transparent" />
      </div>
      <div className="p-6 md:p-8">
        <NewsMeta item={item} lang={lang} readTime className="mb-3" />
        <Title
          item={item}
          as="h2"
          className="font-display font-bold text-white leading-[1.2] text-[22px] md:text-[28px] mb-3 group-hover:text-rs-yellow transition-colors line-clamp-4"
        />
        <p className="text-sm md:text-base text-rs-muted leading-relaxed line-clamp-3 max-w-2xl" lang={item.fallback ? item.textLang : undefined}>
          {item.excerpt}
        </p>
        <p className="mt-5 text-rs-yellow text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
          {t('news.readArticle')} →
        </p>
      </div>
    </Link>
  )
}

/** Image on top, meta, two-line headline, two-line teaser. */
export function NewsCard({ item, lang, excerpt = true }: { item: NewsItem; lang: Lang; excerpt?: boolean }) {
  return (
    <Link href={item.href} className="card-dark group block overflow-hidden h-full">
      <div className="relative aspect-video overflow-hidden isolate">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-5">
        <NewsMeta item={item} lang={lang} className="mb-2" />
        <Title
          item={item}
          className="text-[17px] font-semibold text-white leading-snug group-hover:text-rs-yellow transition-colors line-clamp-3"
        />
        {excerpt && (
          <p className="mt-2 text-xs text-rs-muted line-clamp-2" lang={item.fallback ? item.textLang : undefined}>
            {item.excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}

/** Thumbnail left, headline and teaser right — the list the news page always had. */
export function NewsRow({ item, lang }: { item: NewsItem; lang: Lang }) {
  const t = getT(lang)
  return (
    <Link
      href={item.href}
      className="group flex gap-4 md:gap-6 py-5 border-b border-rs-border hover:bg-rs-dark px-3 -mx-3 transition-colors"
    >
      <div className="relative w-28 sm:w-40 md:w-48 aspect-16/10 shrink-0 rounded-rs overflow-hidden isolate">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 112px, 192px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <NewsMeta item={item} lang={lang} className="mb-1.5" />
        <Title item={item} className="text-rs-white font-semibold leading-snug group-hover:text-rs-yellow transition-colors line-clamp-3 sm:line-clamp-2" />
        <p className="hidden sm:block mt-1 text-rs-muted text-sm line-clamp-2" lang={item.fallback ? item.textLang : undefined}>
          {item.excerpt}
        </p>
      </div>
      <p className="text-rs-muted text-xs shrink-0 text-right hidden lg:block">
        {item.readTime} {t('news.read')}
      </p>
    </Link>
  )
}

/** No image: date, section, headline on one line. Scales to any number of articles. */
export function NewsCompact({ item, lang }: { item: NewsItem; lang: Lang }) {
  return (
    <Link
      href={item.href}
      className="group grid grid-cols-[5.5rem_1fr] sm:grid-cols-[6.5rem_9rem_1fr] gap-x-4 gap-y-0.5 py-3 border-b border-rs-border hover:bg-rs-dark px-3 -mx-3 transition-colors"
    >
      <time dateTime={item.date} className="font-mono text-[11px] text-rs-muted pt-0.5">
        {item.dateShort}
      </time>
      <span className={`hidden sm:block font-mono text-[11px] pt-0.5 truncate ${item.categoryColor}`}>{item.categoryLabel}</span>
      <span className="text-sm text-rs-white group-hover:text-rs-yellow transition-colors" lang={item.fallback ? item.textLang : undefined}>
        {item.title}
        {item.fallback && <span className="ml-2 font-mono text-[10px] text-rs-muted" aria-hidden="true">EN</span>}
      </span>
    </Link>
  )
}

/** A series (or family) as a tile: name, how many articles, RaceSpot badge. */
export function SeriesCard({
  href,
  name,
  family,
  count,
  racespot,
  lang,
}: {
  href: string
  name: string
  family?: string
  count: number
  racespot?: boolean
  lang: Lang
}) {
  const t = getT(lang)
  return (
    <Link
      href={href}
      className="group block h-full rounded-rs border border-rs-border border-l-[3px] border-l-rs-yellow/60 bg-rs-dark px-4 py-3 hover:border-l-rs-yellow hover:bg-rs-gray transition-colors"
    >
      {family && <p className="font-mono text-[10px] uppercase tracking-wider text-rs-muted mb-0.5">{family}</p>}
      <p className="font-semibold text-sm text-rs-white leading-snug group-hover:text-rs-yellow transition-colors">{name}</p>
      <p className="mt-1 text-[11px] text-rs-muted">
        {count === 1 ? t('news.countOne') : t('news.countMany').replace('{n}', String(count))}
        {racespot && <span className="text-rs-yellow/80"> · {t('news.producedByRacespot')}</span>}
      </p>
    </Link>
  )
}
