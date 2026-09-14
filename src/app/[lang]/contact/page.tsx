import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import { ContactForm } from '@/components/sections/ContactForm'
import type { Lang } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return staticPageMetadata(lang, '/contact', 'contact', '/og-contact.jpg')
}

export default async function ContactPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return <ContactForm lang={lang} />
}
