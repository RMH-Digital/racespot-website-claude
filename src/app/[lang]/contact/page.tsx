import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import { ContactForm } from '@/components/sections/ContactForm'
import type { Lang } from '@/lib/i18n'

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return staticPageMetadata(lang, '/contact', 'contact', '/og-contact.jpg')
}

export default function ContactPage({ params: { lang } }: { params: { lang: Lang } }) {
  return <ContactForm lang={lang} />
}
