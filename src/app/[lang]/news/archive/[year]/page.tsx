import type { Metadata } from 'next'
import type { Lang } from '@/lib/i18n'
import { archiveYears } from '@/lib/newsIndex'
import { ArchivePage, archiveMetadata } from '@/components/news/listings'

interface Props {
  params: Promise<{ lang: Lang; year: string }>
}

/** One page per year that has articles. */
export function generateStaticParams() {
  return archiveYears().map((year) => ({ year }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, year } = await params
  return archiveMetadata(lang, year)
}

export default async function NewsArchivePage({ params }: Props) {
  const { lang, year } = await params
  return <ArchivePage lang={lang} year={year} />
}
