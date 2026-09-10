import type { Metadata } from 'next'
import { ContactForm } from '@/components/sections/ContactForm'
import type { Lang } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Racespot — broadcast production, event support, and partnership inquiries.',
  openGraph: {
    title: 'Contact | Racespot.tv',
    description: 'Get in touch with Racespot — broadcast production, event support, and partnership inquiries.',
    images: [{ url: '/og-contact.jpg', width: 1200, height: 630, alt: 'Contact Racespot' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-contact.jpg'] },
}

export default function ContactPage({ params: { lang } }: { params: { lang: Lang } }) {
  return <ContactForm lang={lang} />
}
