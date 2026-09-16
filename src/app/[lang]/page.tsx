import { Hero }             from '@/components/sections/Hero'
import { StatsBar }         from '@/components/sections/StatsBar'
import { LatestBroadcasts } from '@/components/sections/LatestBroadcasts'
import { Services }         from '@/components/sections/Services'
import { PartnerLogos }     from '@/components/sections/PartnerLogos'
import { Positioning }      from '@/components/sections/Positioning'
import { AudienceFork }     from '@/components/sections/AudienceFork'
import { ImageBand }        from '@/components/sections/ImageBand'
import { Process }          from '@/components/sections/Process'
import { PhotoGallery }     from '@/components/sections/PhotoGallery'
import { LatestNews }       from '@/components/sections/LatestNews'
import { ContactCTA }       from '@/components/sections/ContactCTA'
import { getUpcomingEvents, toCalendarEvent } from '@/lib/sheets'
import { withReplays } from '@/lib/replays'
import type { Metadata } from 'next'
import { t, type Lang } from '@/lib/i18n'
import { pageMetadata } from '@/lib/i18n/seo'

/* Re-check events every 5 minutes (ISR) */
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const meta = pageMetadata({
    lang,
    path: '/',
    title: t(lang, 'meta.site.title'),
    description: t(lang, 'meta.site.desc'),
    image: '/og-home.jpg',
  })
  // Next applies a layout's title template to *child* segments only, and the
  // home page sits in the same segment as the layout that defines it — so the
  // brand has to be spelled out here or the title ships without it.
  return { ...meta, title: { absolute: `${t(lang, 'meta.site.title')} | Racespot.tv` } }
}

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  const events = await getUpcomingEvents(3)

  // Next upcoming event for hero (when not live), with its announced
  // YouTube stream attached when there is one — that is where the bell is.
  const nextEvent = events.find(e => e.isUpcoming)
  const [nextCal] = nextEvent ? await withReplays([toCalendarEvent(nextEvent)]) : []

  return (
    <>
      <Hero
        lang={lang}
        nextEventSeries={nextEvent?.series}
        nextEventDateISO={nextEvent?.date.toISOString()}
        nextEvent={nextCal}
      />
      <StatsBar lang={lang} />
      {/* Viewers and clients get their own door, right after the numbers. */}
      <AudienceFork lang={lang} />
      <LatestBroadcasts lang={lang} />
      {/* Full-bleed breather so the two card grids don't run into each other. */}
      <ImageBand lang={lang} />
      <Services lang={lang} />
      <Process lang={lang} />
      <LatestNews lang={lang} />
      {/* Who we are, immediately before the logos: first what we stand for,
          then who trusts us with it. */}
      <Positioning lang={lang} />
      <PartnerLogos lang={lang} />
      <PhotoGallery lang={lang} />
      <ContactCTA lang={lang} />
    </>
  )
}
