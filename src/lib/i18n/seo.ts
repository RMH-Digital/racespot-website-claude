import type { Metadata } from 'next'
import { LANGS, type Lang } from './langs'
import { localePath } from './langs'
import { OG_LOCALES, t } from './index'
import type { TranslationKey } from './translations'

export const SITE_URL = 'https://racespot.tv'

export function absoluteUrl(lang: Lang, path: string): string {
  return `${SITE_URL}${localePath(lang, path)}`
}

/**
 * `<link rel="alternate" hreflang>` set for one page. `x-default` is the
 * English page — English is where an unknown visitor lands. Pass `langs` to
 * restrict the set: an article that exists in three languages advertises
 * exactly those three (docs/TODO.md, item 1: never index a fallback).
 */
export function alternatesFor(lang: Lang, path: string, langs: readonly Lang[] = LANGS): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {}
  for (const l of langs) languages[l] = absoluteUrl(l, path)
  languages['x-default'] = absoluteUrl('en', path)
  return {
    canonical: absoluteUrl(lang, path),
    languages,
  }
}

interface PageMeta {
  lang: Lang
  /** Language-free path, e.g. `/services` */
  path: string
  title: string
  description: string
  /** Site-relative OG image, e.g. `/og-services.jpg` */
  image: string
  /** Languages this page exists in; default all six. */
  langs?: readonly Lang[]
  type?: 'website' | 'article'
}

/**
 * Complete per-page metadata. Next does not merge nested `openGraph` with
 * the layout's, so every page states the full object here.
 */
export function pageMetadata({ lang, path, title, description, image, langs, type = 'website' }: PageMeta): Metadata {
  const alternateLocale = LANGS.filter((l) => l !== lang && (!langs || langs.includes(l))).map((l) => OG_LOCALES[l])
  return {
    title,
    description,
    alternates: alternatesFor(lang, path, langs),
    openGraph: {
      type,
      locale: OG_LOCALES[lang],
      alternateLocale,
      siteName: 'Racespot.tv',
      url: absoluteUrl(lang, path),
      title: `${title} | Racespot.tv`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', images: [image] },
  }
}

/** Shorthand for the static pages whose title/description live in translations.ts. */
export function staticPageMetadata(lang: Lang, path: string, key: string, image: string): Metadata {
  return pageMetadata({
    lang,
    path,
    title: t(lang, `meta.${key}.title` as TranslationKey),
    description: t(lang, `meta.${key}.desc` as TranslationKey),
    image,
  })
}
