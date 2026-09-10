import type { Metadata } from 'next'
import { legalPageMetadata } from '@/lib/i18n/seo'
import type { Lang } from '@/lib/i18n'
import { LegalDocument } from '@/components/sections/LegalDocument'
import { TERMS } from '@/lib/i18n/legal/terms'

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return legalPageMetadata(lang, '/terms', 'terms')
}

export default function TermsPage({ params: { lang } }: { params: { lang: Lang } }) {
  return (
    <LegalDocument
      lang={lang}
      titleKey="meta.terms.title"
      docs={TERMS}
      related={[
        { path: '/imprint', labelKey: 'footer.imprint' },
        { path: '/privacy', labelKey: 'footer.privacyPolicy' },
      ]}
    />
  )
}
