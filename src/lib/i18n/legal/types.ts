/**
 * Legal pages (privacy policy, terms) as data, one document per language.
 *
 * Text may carry the same three inline constructs as article bodies —
 * `**bold**`, `*italic*`, `[label](url)` — and is rendered through
 * renderInline(), never as HTML.
 *
 * REVIEW: the five non-English versions were machine-assisted translations
 * produced on 2026-09-10 and have NOT been approved by a person yet. The
 * English text is the reference. See docs/TODO.md, item 1.
 */
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
