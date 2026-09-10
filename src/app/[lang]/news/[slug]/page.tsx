import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ARTICLES, CATEGORY_COLORS } from '@/lib/articles'
import { articleLangs, localizeArticle, renderInline } from '@/lib/articleContent'
import { ArticleJsonLd } from '@/components/seo/JsonLd'
import { categoryLabel, formatDate, getT, localePath, type Lang } from '@/lib/i18n'
import { absoluteUrl, pageMetadata } from '@/lib/i18n/seo'

interface Props {
  params: { lang: Lang; slug: string }
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const { lang, slug } = params
  const article = ARTICLES.find((a) => a.slug === slug)
  if (!article) return {}
  const loc = localizeArticle(article, lang)
  const path = `/news/${article.slug}`
  const meta = pageMetadata({
    lang,
    path,
    title: loc.title,
    description: loc.excerpt,
    image: article.image,
    langs: articleLangs(article),
    type: 'article',
  })
  // Untranslated: the page shows the English text, so it is the English
  // page as far as the index is concerned — canonical points there and this
  // language is not in the hreflang set (pageMetadata already left it out).
  if (loc.lang !== lang && meta.alternates) {
    meta.alternates.canonical = absoluteUrl('en', path)
  }
  return meta
}

export default function ArticlePage({ params }: Props) {
  const { lang, slug } = params
  const article = ARTICLES.find((a) => a.slug === slug)
  if (!article) notFound()

  const t = getT(lang)
  const loc = localizeArticle(article, lang)
  const fallback = loc.lang !== lang

  const idx = ARTICLES.indexOf(article)
  const prev = idx > 0 ? ARTICLES[idx - 1] : null
  const next = idx < ARTICLES.length - 1 ? ARTICLES[idx + 1] : null

  return (
    <div>
      <ArticleJsonLd
        lang={loc.lang}
        urlLang={lang}
        title={loc.title}
        description={loc.excerpt}
        image={article.image}
        datePublished={article.date}
        slug={article.slug}
      />
      {/* Hero image */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src={article.image}
          alt={loc.imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/50 to-rs-black/10" />
        {article.imageCredit && (
          <p className="absolute bottom-2.5 right-4 font-mono text-[10px] tracking-wide text-rs-white/45">
            {article.imageCredit}
          </p>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
      </div>

      <div className="container-rs py-12">
        {/* The article's text is in loc.lang; when that is not the page
            language, say so on the element so assistive tech and search
            engines read it correctly. */}
        <article className="max-w-3xl mx-auto" lang={fallback ? loc.lang : undefined}>
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`text-xs font-mono ${CATEGORY_COLORS[article.category] ?? 'text-rs-muted'}`}>
              {categoryLabel(lang, article.category)}
            </span>
            <span className="text-rs-border">·</span>
            <time dateTime={article.date} className="text-rs-muted text-xs">{formatDate(lang, article.date)}</time>
            <span className="text-rs-border">·</span>
            <span className="text-rs-muted text-xs">{loc.readTime} {t('news.read')}</span>
            {article.author && (
              <>
                <span className="text-rs-border">·</span>
                <span className="text-rs-white text-xs">{article.author}</span>
              </>
            )}
          </div>

          {fallback && (
            <p className="mb-6 text-xs text-rs-muted border border-rs-border rounded-rs px-3 py-2 inline-block" lang={lang}>
              {t('news.inEnglishOnly')}
            </p>
          )}

          {/* Title */}
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight mb-8">
            {loc.title}
          </h1>

          {/* Content */}
          <div className="space-y-6">
            {loc.blocks.map((block, i) => {
              if (block.kind === 'h2') {
                return (
                  <h2
                    key={i}
                    className="font-display font-bold text-xl md:text-2xl text-white leading-tight pt-6
                      before:block before:w-8 before:h-[3px] before:rounded-sm before:bg-rs-yellow before:mb-3.5"
                  >
                    {renderInline(block.text)}
                  </h2>
                )
              }
              if (block.kind === 'quote') {
                return (
                  <blockquote
                    key={i}
                    className="relative border-l-[3px] border-rs-yellow rounded-r-lg py-5 pl-6 pr-6
                      bg-gradient-to-r from-rs-yellow/[0.07] to-transparent
                      text-[17px] leading-relaxed text-rs-white/80"
                  >
                    <p>{renderInline(block.text)}</p>
                    {block.attribution && (
                      <footer className="mt-2.5 text-sm text-rs-muted">
                        {renderInline(block.attribution)}
                      </footer>
                    )}
                  </blockquote>
                )
              }
              if (block.kind === 'image') {
                return (
                  <figure key={i} className="my-8">
                    <Image
                      src={block.src}
                      alt={block.alt}
                      width={1600}
                      height={900}
                      className="w-full h-auto rounded-md"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                    {(block.alt || block.credit) && (
                      <figcaption className="mt-2 text-[13px] text-rs-muted">
                        {block.alt}
                        {block.credit && (
                          <span className="ml-1.5 font-mono text-[11px] text-rs-muted/70">
                            {block.credit}
                          </span>
                        )}
                      </figcaption>
                    )}
                  </figure>
                )
              }
              return (
                <p key={i} className="text-rs-muted leading-relaxed text-[16px]">
                  {renderInline(block.text)}
                </p>
              )
            })}
          </div>

          {/* Navigation */}
          <nav className="mt-16 pt-8 border-t border-rs-border flex items-center justify-between gap-4" lang={lang}>
            {prev ? (
              <Link href={localePath(lang, `/news/${prev.slug}`)} className="group text-left">
                <p className="text-xs text-rs-muted mb-1">← {t('news.previous')}</p>
                <p className="text-sm text-rs-white group-hover:text-rs-yellow transition-colors line-clamp-1">
                  {localizeArticle(prev, lang).title}
                </p>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={localePath(lang, `/news/${next.slug}`)} className="group text-right">
                <p className="text-xs text-rs-muted mb-1">{t('news.next')} →</p>
                <p className="text-sm text-rs-white group-hover:text-rs-yellow transition-colors line-clamp-1">
                  {localizeArticle(next, lang).title}
                </p>
              </Link>
            ) : <div />}
          </nav>

          {/* Back link */}
          <div className="mt-8 text-center" lang={lang}>
            <Link href={localePath(lang, '/news')} className="btn-ghost">
              ← {t('news.allNews')}
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
