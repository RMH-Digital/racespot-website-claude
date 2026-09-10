import { Hero }             from '@/components/sections/Hero'
import { StatsBar }         from '@/components/sections/StatsBar'
import { LatestBroadcasts } from '@/components/sections/LatestBroadcasts'
import { Services }         from '@/components/sections/Services'
import { PartnerLogos }     from '@/components/sections/PartnerLogos'
import { PhotoGallery }     from '@/components/sections/PhotoGallery'
import { LatestNews }       from '@/components/sections/LatestNews'
import { ContactCTA }       from '@/components/sections/ContactCTA'
import { getUpcomingEvents } from '@/lib/sheets'
import type { Metadata } from 'next'
import { t, type Lang } from '@/lib/i18n'
import { pageMetadata } from '@/lib/i18n/seo'

/* Re-check events every 5 minutes (ISR) */
export const revalidate = 300

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  const meta = pageMetadata({
    lang,
    path: '/',
    title: t(lang, 'meta.site.title'),
    description: t(lang, 'meta.site.desc'),
    image: '/og-home.jpg',
  })
  // The home title is the full site title, not "… | Racespot.tv".
  return { ...meta, title: { absolute: t(lang, 'meta.site.title') } }
}

export default async function HomePage({ params: { lang } }: { params: { lang: Lang } }) {
  const events = await getUpcomingEvents(3)

  // Next upcoming event for hero (when not live)
  const nextEvent = events.find(e => e.isUpcoming)

  return (
    <>
      <Hero
        lang={lang}
        nextEventSeries={nextEvent?.series}
        nextEventDateISO={nextEvent?.date.toISOString()}
      />
      <StatsBar lang={lang} />
      <LatestBroadcasts lang={lang} />
      <Services lang={lang} />
      <PartnerLogos lang={lang} />
      <PhotoGallery lang={lang} />
      <LatestNews lang={lang} />
      <ContactCTA lang={lang} />
    </>
  )
}
