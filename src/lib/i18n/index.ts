import { translations, type TranslationKey } from './translations'

/**
 * Language handling for the URL-based i18n (`/en/…`, `/de/…`, …).
 *
 * The language is a route parameter, resolved by the middleware and passed
 * down as a plain prop. There is no context and nothing in localStorage: the
 * server renders each page in its language, and a client component that
 * needs a label gets `lang` handed to it.
 */

export const LANGS = ['en', 'de', 'es', 'pt', 'fr', 'it'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'en'

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
]

export function isLang(x: string | undefined | null): x is Lang {
  return typeof x === 'string' && (LANGS as readonly string[]).includes(x)
}

/**
 * BCP 47 locale per language, for `Intl` formatting and `lang` attributes.
 * The Portuguese copy is Brazilian Portuguese (decided 2026-09-10), so its
 * dates and numbers follow pt-BR as well.
 */
export const LOCALES: Record<Lang, string> = {
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-BR',
  fr: 'fr-FR',
  it: 'it-IT',
}

/** Open Graph `og:locale` values — same regions as LOCALES, underscore form. */
export const OG_LOCALES: Record<Lang, string> = {
  en: 'en_US',
  de: 'de_DE',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
  it: 'it_IT',
}

/** Translate a UI string. Falls back to English, then to the key itself. */
export function t(lang: Lang, key: TranslationKey): string {
  const entry = translations[key] as Record<string, string> | undefined
  if (!entry) return key
  return entry[lang] || entry.en || key
}

/** A bound translator for components that look up many keys. */
export function getT(lang: Lang) {
  return (key: TranslationKey) => t(lang, key)
}

/**
 * Prefix a site-relative path with the language: `localePath('de', '/news')`
 * is `/de/news`, the home page is `/de` (Next strips trailing slashes).
 */
export function localePath(lang: Lang, path: string): string {
  if (path === '/' || path === '') return `/${lang}`
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`
}

/** Split `/de/news/x` into its language and the language-free path `/news/x`. */
export function splitPath(pathname: string): { lang: Lang | null; path: string } {
  const [, first = '', ...rest] = pathname.split('/')
  if (isLang(first)) {
    const path = '/' + rest.join('/')
    return { lang: first, path: path === '/' ? '/' : path.replace(/\/$/, '') }
  }
  return { lang: null, path: pathname || '/' }
}

/** The same page in another language — what the language switcher links to. */
export function switchLangPath(pathname: string, lang: Lang): string {
  return localePath(lang, splitPath(pathname).path)
}

export function formatDate(lang: Lang, iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(LOCALES[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
    ...opts,
  })
}
