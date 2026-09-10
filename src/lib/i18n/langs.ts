/**
 * Language constants without any dependency on the dictionary, so the
 * middleware (an edge bundle) can import them without pulling in ~230
 * translated strings. Everything else lives in ./index.ts.
 */

export const LANGS = ['en', 'de', 'es', 'pt', 'fr', 'it'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'en'

/** Cookie that remembers a language the visitor chose on the site. */
export const LANG_COOKIE = 'racespot-lang'
/** Request header the middleware sets so server code outside a route (404 page) knows the language. */
export const LANG_HEADER = 'x-racespot-lang'

export function isLang(x: string | undefined | null): x is Lang {
  return typeof x === 'string' && (LANGS as readonly string[]).includes(x)
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
    const path = ('/' + rest.join('/')).replace(/\/+$/, '')
    return { lang: first, path: path === '' ? '/' : path }
  }
  return { lang: null, path: pathname || '/' }
}

/** The same page in another language — what the language switcher links to. */
export function switchLangPath(pathname: string, lang: Lang): string {
  return localePath(lang, splitPath(pathname).path)
}

/**
 * Pick the best supported language from an Accept-Language header.
 * Region subtags are ignored (`pt-BR` → `pt`); unknown languages skipped.
 */
export function negotiateLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return DEFAULT_LANG
  const ranked = acceptLanguage
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='))
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q.slice(2)) : 1, i }
    })
    .filter((r) => r.tag && r.tag !== '*' && !Number.isNaN(r.q) && r.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i)
  for (const { tag } of ranked) {
    const base = tag.split('-')[0]
    if (isLang(base)) return base
  }
  return DEFAULT_LANG
}
