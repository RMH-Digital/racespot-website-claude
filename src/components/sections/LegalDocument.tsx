import Link from 'next/link'
import { renderInline } from '@/lib/articleContent'
import { getT, localePath, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import type { LegalDoc } from '@/lib/i18n/legal/types'

interface Props {
  lang: Lang
  titleKey: TranslationKey
  doc: LegalDoc
  /** The other legal pages to link at the bottom */
  related: { path: string; labelKey: TranslationKey }[]
}

/** Renders a privacy policy or terms document from its structured form. */
export function LegalDocument({ lang, titleKey, doc, related }: Props) {
  const t = getT(lang)
  return (
    <div className="pt-8">
      <div className="container-rs py-8 max-w-3xl">
        <p className="section-label mb-3">{t('legal.label')}</p>
        <h1 className="display-title mb-10">{t(titleKey)}</h1>
        {doc.updated && <p className="text-rs-muted text-sm mb-10">{doc.updated}</p>}

        <div className="space-y-10 text-rs-muted leading-relaxed text-[15px]">
          {doc.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-white font-semibold text-lg mb-3">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((node, j) => {
                  if (node.kind === 'h3') {
                    return <h3 key={j} className="text-white font-medium mt-5 mb-2">{node.text}</h3>
                  }
                  if (node.kind === 'ul') {
                    return (
                      <ul key={j} className="space-y-1.5 list-disc list-inside">
                        {node.items.map((item, k) => <li key={k}>{renderInline(item)}</li>)}
                      </ul>
                    )
                  }
                  return <p key={j}>{renderInline(node.text)}</p>
                })}
              </div>
            </section>
          ))}

          <div className="border-t border-rs-border pt-8 flex flex-wrap gap-6">
            {related.map((r) => (
              <Link key={r.path} href={localePath(lang, r.path)} className="text-rs-yellow hover:underline text-sm">
                {t(r.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
