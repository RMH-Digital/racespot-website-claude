import Image from 'next/image'
import Link from 'next/link'
import { sortedArticles, CATEGORY_COLORS } from '@/lib/articles'
import { localizeArticle } from '@/lib/articleContent'
import { categoryLabel, formatDate, getT, localePath, type Lang } from '@/lib/i18n'

/**
 * News teaser on the home page: the newest article as a wide feature card,
 * the next three underneath in the same card style the section has always used.
 *
 * Sits directly above "Partners & Networks" — the Press Tool publishes several
 * articles a week, so this is the part of the home page that changes most and
 * belongs above the fold-ish, not at the bottom.
 */
export function LatestNews({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const [FEATURED, ...NEXT_THREE] = sortedArticles().slice(0, 4)
  const feature = localizeArticle(FEATURED, lang)

  return (
    <section className="section">
      <div className="container-rs">
        <div className="section-header">
          <div>
            <p className="section-label mb-2">{t('news.label')}</p>
            <h2 className="section-title">{t('news.title')}</h2>
          </div>
          <Link href={localePath(lang, '/news')} className="btn-ghost hidden sm:flex">
            {t('news.viewAll')}
          </Link>
        </div>

        {/* Featured — image left, text right on desktop; stacked on mobile */}
        <Link
          href={localePath(lang, `/news/${FEATURED.slug}`)}
          className="card-dark group block overflow-hidden mb-5"
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-video lg:aspect-auto lg:min-h-[320px] overflow-hidden isolate">
              <Image
                src={FEATURED.image}
                alt={feature.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-rs-black/60 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-rs-dark/80" />
            </div>

            <div className="p-6 md:p-8 lg:p-9 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-semibold uppercase tracking-widest ${CATEGORY_COLORS[FEATURED.category] ?? 'text-rs-muted'}`}>
                  {categoryLabel(lang, FEATURED.category)}
                </span>
                <span className="text-rs-muted text-xs" aria-hidden="true">·</span>
                <time dateTime={FEATURED.date} className="text-xs text-rs-muted">
                  {formatDate(lang, FEATURED.date)}
                </time>
                <span className="text-rs-muted text-xs" aria-hidden="true">·</span>
                <span className="text-xs text-rs-muted">{feature.readTime} {t('news.read')}</span>
              </div>

              <h3 className="font-display font-bold text-white uppercase leading-[1.15] text-[22px] md:text-[26px] lg:text-[28px] mb-4 group-hover:text-rs-yellow transition-colors line-clamp-4">
                {feature.title}
              </h3>
              <p className="text-sm text-rs-muted leading-relaxed line-clamp-3">
                {feature.excerpt}
              </p>
              <p className="mt-6 text-rs-yellow text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                {t('news.readArticle')} →
              </p>
            </div>
          </div>
        </Link>

        {/* The next three, in the familiar card style */}
        <div className="card-grid card-grid--3">
          {NEXT_THREE.map((article) => {
            const a = localizeArticle(article, lang)
            return (
              <Link
                key={article.slug}
                href={localePath(lang, `/news/${article.slug}`)}
                className="card-dark overflow-hidden group block"
              >
                <div className="relative aspect-video overflow-hidden isolate">
                  <Image
                    src={article.image}
                    alt={a.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-rs-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-widest ${CATEGORY_COLORS[article.category] ?? 'text-rs-muted'}`}>
                      {categoryLabel(lang, article.category)}
                    </span>
                    <span className="text-rs-muted text-xs" aria-hidden="true">·</span>
                    <time dateTime={article.date} className="text-xs text-rs-muted">
                      {formatDate(lang, article.date)}
                    </time>
                  </div>
                  <h3 className="text-[17px] font-semibold text-white leading-snug mb-3 group-hover:text-rs-yellow transition-colors line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="text-xs text-rs-muted line-clamp-2">{a.excerpt}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile: the header link is hidden there */}
        <Link href={localePath(lang, '/news')} className="btn-ghost sm:hidden mt-6">
          {t('news.viewAll')}
        </Link>
      </div>
    </section>
  )
}
