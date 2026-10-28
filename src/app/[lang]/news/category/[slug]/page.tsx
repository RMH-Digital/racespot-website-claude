import type { Metadata } from 'next'
import type { Lang } from '@/lib/i18n'
import { liveCategories } from '@/lib/newsIndex'
import { CategoryPage, categoryMetadata } from '@/components/news/listings'

interface Props {
  params: Promise<{ lang: Lang; slug: string }>
}

/** Only sections that have articles get a page; the others are a 404 until their first article. */
export function generateStaticParams() {
  return liveCategories().map(({ category }) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  return categoryMetadata(lang, slug, 1)
}

export default async function NewsCategoryPage({ params }: Props) {
  const { lang, slug } = await params
  return <CategoryPage lang={lang} slug={slug} page={1} />
}
