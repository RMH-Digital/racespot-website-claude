import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sortedArticles } from '@/lib/articles'
import type { Lang } from '@/lib/i18n'
import { pageParams, parsePage } from '@/lib/newsIndex'
import { FrontPage, frontMetadata } from '@/components/news/listings'

interface Props {
  params: Promise<{ lang: Lang; n: string }>
}

/** Page 2 onwards of /news — exists only once there are more than PAGE_SIZE articles. */
export function generateStaticParams() {
  return pageParams(sortedArticles().length)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, n } = await params
  const page = parsePage(n, sortedArticles().length)
  return page ? frontMetadata(lang, page) : {}
}

export default async function NewsListPage({ params }: Props) {
  const { lang, n } = await params
  const page = parsePage(n, sortedArticles().length)
  if (!page) notFound()
  return <FrontPage lang={lang} page={page} />
}
