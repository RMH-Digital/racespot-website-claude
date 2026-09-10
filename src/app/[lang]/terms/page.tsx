import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import type { Lang } from '@/lib/i18n'
import { LegalDocument } from '@/components/sections/LegalDocument'
import { TERMS } from '@/lib/i18n/legal/terms'

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return staticPageMetadata(lang, '/terms', 'terms', '/og-home.jpg')
}

export default function TermsPage({ params: { lang } }: { params: { lang: Lang } }) {
  return (
    <LegalDocument
      lang={lang}
      titleKey="meta.terms.title"
      doc={TERMS[lang]}
      related={[
        { path: '/imprint', labelKey: 'footer.imprint' },
        { path: '/privacy', labelKey: 'footer.privacyPolicy' },
      ]}
    />
  )
}
