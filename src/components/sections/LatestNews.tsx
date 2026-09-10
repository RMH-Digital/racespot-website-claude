import Image from 'next/image'
import Link from 'next/link'
import { ARTICLES, CATEGORY_COLORS } from '@/lib/articles'
import { getT, localePath, type Lang } from '@/lib/i18n'

const LATEST = ARTICLES.slice(0, 3)

export function LatestNews({ lang }: { lang: Lang }) {
  const t = getT(lang)

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

        <div className="card-grid card-grid--3">
          {LATEST.map((article) => (
            <Link key={article.slug} href={localePath(lang, `/news/${article.slug}`)} className="card-dark overflow-hidden group cursor-pointer block">
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rs-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${CATEGORY_COLORS[article.category] ?? 'text-rs-muted'}`}>
                    {article.category}
                  </span>
                  <span className="text-rs-border text-xs">·</span>
                  <span className="text-xs text-rs-muted">{article.date}</span>
                </div>
                <h3 className="text-[17px] font-semibold text-white leading-snug mb-3 group-hover:text-rs-yellow transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-rs-muted line-clamp-2">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
