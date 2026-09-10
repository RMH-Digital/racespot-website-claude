import { Hero }             from '@/components/sections/Hero'
import { StatsBar }         from '@/components/sections/StatsBar'
import { LatestBroadcasts } from '@/components/sections/LatestBroadcasts'
import { Services }         from '@/components/sections/Services'
import { PartnerLogos }     from '@/components/sections/PartnerLogos'
import { PhotoGallery }     from '@/components/sections/PhotoGallery'
import { LatestNews }       from '@/components/sections/LatestNews'
import { ContactCTA }       from '@/components/sections/ContactCTA'
import { getUpcomingEvents } from '@/lib/sheets'

/* Re-check events every 5 minutes (ISR) */
export const revalidate = 300

export default async function HomePage() {
  const events = await getUpcomingEvents(3)

  // Next upcoming event for hero (when not live)
  const nextEvent = events.find(e => e.isUpcoming)

  return (
    <>
      <Hero
        nextEventSeries={nextEvent?.series}
        nextEventDateISO={nextEvent?.date.toISOString()}
      />
      <StatsBar />
      <LatestBroadcasts />
      <Services />
      <PartnerLogos />
      <PhotoGallery />
      <LatestNews />
      <ContactCTA />
    </>
  )
}
