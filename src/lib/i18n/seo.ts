import type { Metadata } from 'next'
import { LANGS, type Lang } from './langs'
import { localePath } from './langs'
import { OG_LOCALES, t } from './index'
import type { TranslationKey } from './translations'
import { LEGAL_LANGS, legalLang } from './legal/types'

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

/**
 * Search results cut a description off around 160 characters, mid-word if
 * necessary. News articles feed their excerpt in here and excerpts run to
 * 200-240, so they were being shown truncated. Cut at the last sentence that
 * fits; failing that at a word boundary, with an ellipsis to show it continues.
 */
export function clampDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const head = clean.slice(0, max + 1)
  const sentenceEnd = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '))
  if (sentenceEnd > max * 0.6) return clean.slice(0, sentenceEnd + 1)

  const wordEnd = head.lastIndexOf(' ')
  return clean.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[,;:–—-]$/, '') + '…'
}

/**
 * Headline long enough that "<headline> | Racespot.tv" would be truncated?
 * Then drop the brand rather than the end of the headline — the brand is
 * already in the URL, the domain line and the site name in rich results.
 *
 * The budget is 55, matching the ceiling agreed for `seoTitle`: 55 plus the
 * fourteen characters of " | Racespot.tv" is 69, and what a search result
 * trims off the end of that is the brand, which costs nothing. It was 46,
 * tuned before short titles existed, which made anything from 47 characters up
 * drop the brand for no reason — a 47-character title and a 45-character one
 * were being treated completely differently.
 */
export function titleWithBrand(title: string, budget = 55): Metadata['title'] {
  return title.length > budget ? { absolute: title } : title
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
    twitter: { card: 'summary_large_image', site: '@RaceSpotTV', creator: '@RaceSpotTV', title: `${title} | Racespot.tv`, description, images: [image] },
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

/**
 * Privacy and terms exist in en and de only. Other page languages show the
 * English document, so their metadata is the English page's: English title
 * and description, canonical on /en/, hreflang for en and de only.
 */
export function legalPageMetadata(lang: Lang, path: string, key: string): Metadata {
  const docLang = legalLang(lang)
  const meta = pageMetadata({
    lang,
    path,
    title: t(docLang, `meta.${key}.title` as TranslationKey),
    description: t(docLang, `meta.${key}.desc` as TranslationKey),
    image: '/og-home.jpg',
    langs: LEGAL_LANGS,
  })
  if (docLang !== lang && meta.alternates) meta.alternates.canonical = absoluteUrl('en', path)
  return meta
}
