import type { Metadata } from 'next'
import type { Lang } from '@/lib/i18n'
import { seriesPageSlugs } from '@/lib/newsIndex'
import { SeriesPage, seriesMetadata } from '@/components/news/listings'

interface Props {
  params: Promise<{ lang: Lang; slug: string }>
}

/** Series with articles, and families with at least two such series. Everything else is a 404 for now. */
export function generateStaticParams() {
  return seriesPageSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  return seriesMetadata(lang, slug, 1)
}

export default async function NewsSeriesPage({ params }: Props) {
  const { lang, slug } = await params
  return <SeriesPage lang={lang} slug={slug} page={1} />
}
