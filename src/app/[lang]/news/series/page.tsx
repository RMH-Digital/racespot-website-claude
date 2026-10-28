import type { Metadata } from 'next'
import type { Lang } from '@/lib/i18n'
import { SeriesIndexPage, seriesIndexMetadata } from '@/components/news/listings'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return seriesIndexMetadata(lang)
}

export default async function NewsSeriesIndexPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return <SeriesIndexPage lang={lang} />
}
