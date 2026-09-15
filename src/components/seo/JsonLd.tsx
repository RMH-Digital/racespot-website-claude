/**
 * JSON-LD Structured Data for SEO
 * Renders schema.org markup in the page head
 */
import { LOCALES, type Lang } from '@/lib/i18n'

/** Stable node id for the company, so other blocks can reference it once. */
const ORGANIZATION_ID = 'https://racespot.tv/#organization'

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'Racespot Media House GmbH',
    alternateName: 'Racespot.tv',
    url: 'https://racespot.tv',
    logo: 'https://racespot.tv/icon-512.png',
    image: 'https://racespot.tv/og-home.jpg',
    description:
      "World's leading simracing broadcast studio. 400+ live events per year across iRacing, Assetto Corsa, rFactor 2 and more.",
    legalName: 'Racespot Media House GmbH',
    foundingDate: '2013',
    // Matches the imprint exactly — search engines cross-check company
    // details against the imprint, and a VAT ID is a strong entity signal.
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'An der Hasenkaule 10 (21D)',
      postalCode: '50354',
      addressLocality: 'Hürth',
      addressRegion: 'Nordrhein-Westfalen',
      addressCountry: 'DE',
    },
    vatID: 'DE367742438',
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

interface Crumb {
  name: string
  /** Absolute URL; omit on the last crumb, which is the current page. */
  url?: string
}

/**
 * Breadcrumb trail for search results — Google replaces the bare URL with it.
 * Worth having wherever a page sits below a section: an article is
 * "racespot.tv › News › Headline" rather than a path with a slug in it.
 *
 * The last item carries no `item`, per Google's guidance: it is the page the
 * reader is already on.
 */
export function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.url ? { item: c.url } : {}),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export interface ScheduledBroadcast {
  id: string
  series: string
  description: string
  dateISO: string
  endDateISO: string
}

/**
 * The broadcast schedule as schema.org Events.
 *
 * These are real scheduled productions with a start, an end and a place to
 * watch them, which is exactly what Event markup is for — and it is the one
 * thing on this site that can earn an event rich result. Only future events
 * are listed: marking up a race that already happened is noise at best.
 *
 * Every broadcast goes out free on the Racespot channel, which is what the
 * zero-price offer states; `VirtualLocation` points at the /live page, the
 * same destination the calendar's own links use.
 *
 * Pass the list through `upcomingBroadcasts()` first — reading the clock is
 * the caller's job, not a component's.
 */
export function upcomingBroadcasts<T extends ScheduledBroadcast>(events: T[], limit = 30): T[] {
  const now = Date.now()
  return events
    .filter((e) => {
      const t = Date.parse(e.dateISO)
      return Number.isFinite(t) && t > now
    })
    .slice(0, limit)
}

export function BroadcastScheduleJsonLd({ lang, events: upcoming }: { lang: Lang; events: ScheduledBroadcast[] }) {
  if (upcoming.length === 0) return null

  const watchUrl = `https://racespot.tv/${lang}/live`
  const location = { '@type': 'VirtualLocation', url: watchUrl }
  const organizer = { '@id': ORGANIZATION_ID }
  const offers = {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    url: watchUrl,
  }

  // One @graph rather than 30 standalone objects: the shared context is
  // written once and the organizer is a reference to the node the layout
  // already emits, which keeps this block from dominating the page.
  const schema = {
    '@context': 'https://schema.org',
    '@graph': upcoming.map((e) => ({
      '@type': 'Event',
      name: e.description ? `${e.series} — ${e.description}` : e.series,
      startDate: e.dateISO,
      ...(Number.isFinite(Date.parse(e.endDateISO)) ? { endDate: e.endDateISO } : {}),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location,
      image: 'https://racespot.tv/og-calendar.jpg',
      organizer,
      offers,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
