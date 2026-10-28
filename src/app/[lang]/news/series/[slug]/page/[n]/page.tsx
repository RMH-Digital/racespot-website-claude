import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Lang } from '@/lib/i18n'
import { pageParams, parsePage, resolveSeriesPage, seriesPageSlugs } from '@/lib/newsIndex'
import { SeriesPage, seriesMetadata } from '@/components/news/listings'

interface Props {
  params: Promise<{ lang: Lang; slug: string; n: string }>
}

export function generateStaticParams() {
  return seriesPageSlugs().flatMap((slug) =>
    pageParams(resolveSeriesPage(slug)?.articles.length ?? 0).map(({ n }) => ({ slug, n }))
  )
}

function resolve(slug: string, n: string) {
  const found = resolveSeriesPage(slug)
  return found ? parsePage(n, found.articles.length) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug, n } = await params
  const page = resolve(slug, n)
  return page ? seriesMetadata(lang, slug, page) : {}
}

export default async function NewsSeriesListPage({ params }: Props) {
  const { lang, slug, n } = await params
  const page = resolve(slug, n)
  if (!page) notFound()
  return <SeriesPage lang={lang} slug={slug} page={page} />
}
