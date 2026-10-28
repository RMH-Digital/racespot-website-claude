import type { Metadata } from 'next'
import type { Lang } from '@/lib/i18n'
import { FrontPage, frontMetadata } from '@/components/news/listings'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return frontMetadata(lang, 1)
}

export default async function NewsPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return <FrontPage lang={lang} page={1} />
}
