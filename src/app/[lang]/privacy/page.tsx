import type { Metadata } from 'next'
import { legalPageMetadata } from '@/lib/i18n/seo'
import type { Lang } from '@/lib/i18n'
import { LegalDocument } from '@/components/sections/LegalDocument'
import { PRIVACY } from '@/lib/i18n/legal/privacy'

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return legalPageMetadata(lang, '/privacy', 'privacy')
}

export default function PrivacyPage({ params: { lang } }: { params: { lang: Lang } }) {
  return (
    <LegalDocument
      lang={lang}
      titleKey="meta.privacy.title"
      docs={PRIVACY}
      related={[
        { path: '/imprint', labelKey: 'footer.imprint' },
        { path: '/terms', labelKey: 'footer.terms' },
      ]}
    />
  )
}
