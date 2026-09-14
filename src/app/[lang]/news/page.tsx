import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import Image from 'next/image'
import { ARTICLES, CATEGORY_COLORS } from '@/lib/articles'
import { localizeArticle } from '@/lib/articleContent'
import { categoryLabel, formatDate, getT, localePath, type Lang } from '@/lib/i18n'
import { NewsBrowser, type NewsItem } from '@/components/sections/NewsBrowser'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return staticPageMetadata(lang, '/news', 'news', '/og-news.jpg')
}

export default async function NewsPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  const t = getT(lang)

  // Localise on the server and hand the client only what the list needs —
  // never the article bodies, which would bloat the page payload.
  const items: NewsItem[] = ARTICLES.map((article) => {
    const a = localizeArticle(article, lang)
    return {
      slug: article.slug,
      href: localePath(lang, `/news/${article.slug}`),
      category: article.category,
      categoryLabel: categoryLabel(lang, article.category),
      categoryColor: CATEGORY_COLORS[article.category] ?? 'text-rs-muted',
      date: article.date,
      dateLabel: formatDate(lang, article.date),
      image: article.image,
      imageAlt: a.imageAlt,
      title: a.title,
      excerpt: a.excerpt,
      readTime: a.readTime,
    }
  })

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src="/images/gallery/Coanda_LMVS_IRL_LM24-177.jpg"
          alt={t('news.heroAlt')}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3">{t('news.latest')}</p>
            <h1 className="display-title">{t('meta.news.title')}</h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-16">
        <NewsBrowser
          items={items}
          labels={{
            all: t('news.filterAll'),
            filterLabel: t('news.filterLabel'),
            noResults: t('news.noResults'),
            showAll: t('news.showAll'),
            read: t('news.read'),
            readArticle: t('news.readArticle'),
            countOne: t('news.countOne'),
            countMany: t('news.countMany'),
          }}
        />
      </div>
    </div>
  )
}
