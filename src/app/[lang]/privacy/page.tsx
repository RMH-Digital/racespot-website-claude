import type { Metadata } from 'next'
import { legalPageMetadata } from '@/lib/i18n/seo'
import type { Lang } from '@/lib/i18n'
import { LegalDocument } from '@/components/sections/LegalDocument'
import { PRIVACY } from '@/lib/i18n/legal/privacy'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return legalPageMetadata(lang, '/privacy', 'privacy')
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
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
