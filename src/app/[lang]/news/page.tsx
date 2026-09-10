import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ARTICLES, CATEGORY_COLORS } from '@/lib/articles'

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest news, insights, and updates from Racespot — the simracing broadcast team.',
  openGraph: {
    title: 'News | Racespot.tv',
    description: 'Latest news, insights, and updates from Racespot — the simracing broadcast team.',
    images: [{ url: '/og-news.jpg', width: 1200, height: 630, alt: 'Racespot news' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-news.jpg'] },
}

export default function NewsPage() {
  const [featured, ...rest] = ARTICLES

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src="/images/gallery/Coanda_LMVS_IRL_LM24-177.jpg"
          alt="Racespot broadcast production"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3">Latest</p>
            <h1 className="display-title">News</h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-16">

        {/* Featured */}
        <Link href={`/news/${featured.slug}`} className="group block mb-16">
          <div className="bg-rs-dark border border-rs-border hover:border-rs-yellow/40 transition-colors overflow-hidden">
            <div className="relative aspect-[21/9] w-full overflow-hidden isolate">
              <Image
                src={featured.image}
                alt={featured.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rs-black/80 via-rs-black/20 to-transparent" />
            </div>
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-mono ${CATEGORY_COLORS[featured.category] ?? 'text-rs-muted'}`}>
                  {featured.category}
                </span>
                <span className="text-rs-border">·</span>
                <span className="text-rs-muted text-xs">{featured.date}</span>
                <span className="text-rs-border">·</span>
                <span className="text-rs-muted text-xs">{featured.readTime} read</span>
              </div>
              <h2 className="text-rs-white text-2xl md:text-3xl font-bold mb-4 group-hover:text-rs-yellow transition-colors leading-snug">
                {featured.title}
              </h2>
              <p className="text-rs-muted max-w-2xl leading-relaxed">{featured.excerpt}</p>
              <p className="mt-6 text-rs-yellow text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                Read article →
              </p>
            </div>
          </div>
        </Link>

        {/* Article list */}
        <div className="space-y-px">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/news/${article.slug}`}
              className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 py-6 border-b border-rs-border hover:bg-rs-dark px-4 -mx-4 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative w-full md:w-48 aspect-video md:aspect-[16/10] shrink-0 rounded-rs overflow-hidden isolate">
                <Image
                  src={article.image}
                  alt={article.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`text-xs font-mono ${CATEGORY_COLORS[article.category] ?? 'text-rs-muted'}`}>
                    {article.category}
                  </span>
                  <span className="text-rs-border">·</span>
                  <span className="text-rs-muted text-xs">{article.date}</span>
                </div>
                <h3 className="text-rs-white font-semibold group-hover:text-rs-yellow transition-colors mb-1">
                  {article.title}
                </h3>
                <p className="text-rs-muted text-sm line-clamp-2">{article.excerpt}</p>
              </div>
              <div className="text-rs-muted text-xs shrink-0 text-right hidden md:block">
                <p>{article.readTime} read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
