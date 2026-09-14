import type { Metadata } from 'next'
import { legalPageMetadata } from '@/lib/i18n/seo'
import type { Lang } from '@/lib/i18n'
import { LegalDocument } from '@/components/sections/LegalDocument'
import { TERMS } from '@/lib/i18n/legal/terms'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return legalPageMetadata(lang, '/terms', 'terms')
}

export default async function TermsPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
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
