/**
 * JSON-LD Structured Data for SEO
 * Renders schema.org markup in the page head
 */
import { LOCALES, type Lang } from '@/lib/i18n'

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Racespot Media House GmbH',
    alternateName: 'Racespot.tv',
    url: 'https://racespot.tv',
    logo: 'https://racespot.tv/icon-512.png',
    image: 'https://racespot.tv/og-home.jpg',
    description:
      "World's leading simracing broadcast studio. 400+ live events per year across iRacing, Assetto Corsa, rFactor 2 and more.",
    foundingDate: '2013',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hürth',
      addressCountry: 'DE',
    },
    sameAs: [
      'https://www.youtube.com/@RaceSpotTV',
      'https://www.twitch.tv/racespottv',
      'https://www.instagram.com/racespottv',
      'https://www.tiktok.com/@racespot_tv',
      'https://www.facebook.com/RaceSpotTV',
      'https://x.com/racespottv',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@racespot.tv',
      contactType: 'customer service',
    },
    knowsAbout: [
      'Sim Racing',
      'Esports Broadcasting',
      'Live Event Production',
      'iRacing',
      'Motorsport',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteJsonLd({ lang }: { lang: Lang }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Racespot.tv',
    url: `https://racespot.tv/${lang}`,
    inLanguage: LOCALES[lang],
    description:
      "World's leading simracing broadcast studio. Professional broadcast production for simracing events.",
    publisher: {
      '@type': 'Organization',
      name: 'Racespot Media House GmbH',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ArticleJsonLdProps {
  /** Language of the rendered text (English when the article has no translation) */
  lang: Lang
  /** Language of the URL the reader is on */
  urlLang: Lang
  title: string
  description: string
  image: string
  datePublished: string
  slug: string
}

export function ArticleJsonLd({ lang, urlLang, title, description, image, datePublished, slug }: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image: `https://racespot.tv${image}`,
    datePublished,
    dateModified: datePublished,
    inLanguage: LOCALES[lang],
    url: `https://racespot.tv/${urlLang}/news/${slug}`,
    author: {
      '@type': 'Organization',
      name: 'Racespot Media House GmbH',
      url: 'https://racespot.tv',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Racespot.tv',
      logo: {
        '@type': 'ImageObject',
        url: 'https://racespot.tv/icon-512.png',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
