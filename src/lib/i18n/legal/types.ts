import type { Lang } from '../langs'

/**
 * Legal pages (privacy policy, terms) as data.
 *
 * Decided 2026-09-10 (Jürgen): legal texts exist in **German and English
 * only**. A German visitor reads German, every other language reads the
 * English text — a page in the wrong language behaves like an untranslated
 * article: canonical on /en/, no hreflang, no sitemap entry.
 *
 * Text may carry the same three inline constructs as article bodies —
 * `**bold**`, `*italic*`, `[label](url)` — and is rendered through
 * renderInline(), never as HTML.
 *
 * The German version was translated and approved on 2026-09-10 (Jürgen).
 * English is the reference text.
 */
export const LEGAL_LANGS = ['en', 'de'] as const
export type LegalLang = (typeof LEGAL_LANGS)[number]

/** The language a legal document is shown in for a page language. */
export function legalLang(lang: Lang): LegalLang {
  return lang === 'de' ? 'de' : 'en'
}

export type LegalNode =
  | { kind: 'p'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'ul'; items: string[] }

export interface LegalSection {
  heading: string
  body: LegalNode[]
}

export interface LegalDoc {
  /** "Last updated" line under the title, already in the document's language; omit to hide. */
  updated?: string
  sections: LegalSection[]
}

export const p = (text: string): LegalNode => ({ kind: 'p', text })
export const h3 = (text: string): LegalNode => ({ kind: 'h3', text })
export const ul = (...items: string[]): LegalNode => ({ kind: 'ul', items })
