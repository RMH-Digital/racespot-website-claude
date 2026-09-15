import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import { notFound } from 'next/navigation'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { NavigationProgress } from '@/components/layout/NavigationProgress'
import { TickerServer } from '@/components/layout/TickerServer'
import { Footer } from '@/components/layout/Footer'
import { LiveStatusProvider } from '@/components/layout/LiveStatusProvider'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd'
import { Analytics } from '@/components/seo/Analytics'
import { DEFAULT_LANG, LANGS, OG_LOCALES, isLang, t, type Lang } from '@/lib/i18n'
import { SITE_URL } from '@/lib/i18n/seo'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const dynamicParams = false

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const l: Lang = isLang(lang) ? lang : DEFAULT_LANG
  const siteTitle = t(l, 'meta.site.title')
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteTitle} | Racespot.tv`,
      template: '%s | Racespot.tv',
    },
    description: t(l, 'meta.site.desc'),
    keywords: ['simracing', 'esports', 'broadcast', 'live events', 'iRacing', 'motorsport'],
    icons: {
      icon: [
        // /favicon.ico first: it is what a browser asks for when it ignores
        // the markup, and what Google reads for the result-list favicon.
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
        { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/site.webmanifest',
    // Pages state their own complete openGraph (Next replaces, not merges,
    // nested metadata objects); this is the fallback for anything that does not.
    openGraph: {
      type: 'website',
      locale: OG_LOCALES[l],
      alternateLocale: LANGS.filter((x) => x !== l).map((x) => OG_LOCALES[x]),
      siteName: 'Racespot.tv',
      images: [{ url: '/og-home.jpg', width: 1200, height: 630, alt: siteTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@RaceSpotTV',
      creator: '@RaceSpotTV',
      images: ['/og-home.jpg'],
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  return (
    <html lang={lang} className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <OrganizationJsonLd />
        <WebsiteJsonLd lang={lang} />
      </head>
      <body className="bg-rs-black text-white" suppressHydrationWarning>
        {/* First stop for the keyboard: the fixed header is ten tab stops deep,
            and every page starts behind it. Styled in globals.css. */}
        <a href="#content" className="skip-link">{t(lang, 'a11y.skipToContent')}</a>
        <LiveStatusProvider>
          <NavigationProgress lang={lang} />
          <Header lang={lang} />
          <TickerServer lang={lang} />
          {/* Offset for fixed header (64px) + ticker (34px) = 98px */}
          <main id="content" className="pt-[98px]">{children}</main>
          <Footer lang={lang} />
        </LiveStatusProvider>
        <Analytics />
      </body>
    </html>
  )
}
