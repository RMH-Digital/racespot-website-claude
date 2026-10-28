import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Lang } from '@/lib/i18n'
import { liveCategories, pageParams, parsePage, resolveCategoryPage } from '@/lib/newsIndex'
import { CategoryPage, categoryMetadata } from '@/components/news/listings'

interface Props {
  params: Promise<{ lang: Lang; slug: string; n: string }>
}

export function generateStaticParams() {
  return liveCategories().flatMap(({ category, count }) => pageParams(count).map(({ n }) => ({ slug: category.slug, n })))
}

function resolve(slug: string, n: string) {
  const found = resolveCategoryPage(slug)
  return found ? parsePage(n, found.articles.length) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug, n } = await params
  const page = resolve(slug, n)
  return page ? categoryMetadata(lang, slug, page) : {}
}

export default async function NewsCategoryListPage({ params }: Props) {
  const { lang, slug, n } = await params
  const page = resolve(slug, n)
  if (!page) notFound()
  return <CategoryPage lang={lang} slug={slug} page={page} />
}
