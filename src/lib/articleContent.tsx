import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Article, Block } from './articles'

/**
 * Article body helpers.
 *
 * The editorial tool writes articles as markdown, but only ever uses four
 * inline constructs: bold, italic, and links. Rather than pull in a markdown
 * renderer for that, the three are parsed here into React elements.
 *
 * That choice is about safety as much as bundle size: article text is written by
 * an automated pipeline, so it must never reach the page through
 * dangerouslySetInnerHTML. Building elements means a stray `<script>` in a
 * source feed is text, not markup.
 */

// Order matters: bold before italic, or `**x**` matches as italic twice.
const INLINE_SOURCE = '(\\*\\*[^*]+?\\*\\*|\\*[^*]+?\\*|\\[[^\\]]+?\\]\\([^)]+?\\))'
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  // a fresh regex per call: a shared /g/ object carries lastIndex between calls,
  // which would make the second paragraph on a page parse from the wrong offset
  const re = new RegExp(INLINE_SOURCE, 'g')
  let last = 0
  let i = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    const start = match.index
    if (start > last) out.push(text.slice(last, start))
    const token = match[0]
    const key = `i${i++}`

    if (token.startsWith('**')) {
      out.push(
        <strong key={key} className="font-semibold text-rs-white">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('*')) {
      out.push(
        <em key={key} className="italic text-rs-yellow/80">
          {token.slice(1, -1)}
        </em>,
      )
    } else {
      const link = token.match(LINK)
      if (!link) {
        out.push(token)
      } else {
        const [, label, href] = link
        const external = /^https?:\/\//.test(href)
        out.push(
          external ? (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rs-yellow underline decoration-rs-yellow/40 hover:decoration-rs-yellow"
            >
              {label}
            </a>
          ) : (
            <Link
              key={key}
              href={href}
              className="text-rs-yellow underline decoration-rs-yellow/40 hover:decoration-rs-yellow"
            >
              {label}
            </Link>
          ),
        )
      }
    }
    last = start + token.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/**
 * One shape to render, whichever shape the article was written in. A `string[]`
 * article is simply a list of paragraphs — that is what it always meant.
 */
export function toBlocks(article: Article): Block[] {
  const content = article.content
  if (content.length === 0) return []
  if (typeof content[0] === 'string') {
    return (content as string[]).map((text) => ({ kind: 'p', text }))
  }
  return content as Block[]
}

/** Plain text of the body — for read-time estimates and meta descriptions. */
export function plainText(article: Article): string {
  return toBlocks(article)
    .map((b) => (b.kind === 'image' ? b.alt : b.text))
    .join(' ')
    .replace(/\*\*|\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}
