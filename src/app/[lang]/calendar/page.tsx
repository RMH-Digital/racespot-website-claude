import type { Metadata } from 'next'
import { getCalendarEvents } from '@/lib/sheets'
import { CalendarClient } from '@/components/sections/CalendarClient'
import { getT, type Lang } from '@/lib/i18n'

/* Refresh calendar data every 5 minutes */
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Upcoming sim racing broadcasts and live events — schedule and stream links.',
  openGraph: {
    title: 'Calendar | Racespot.tv',
    description: 'Upcoming sim racing broadcasts and live events — schedule and stream links.',
    images: [{ url: '/og-calendar.jpg', width: 1200, height: 630, alt: 'Racespot broadcast schedule' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-calendar.jpg'] },
}

export default async function CalendarPage({ params: { lang } }: { params: { lang: Lang } }) {
  const t = getT(lang)
  const events = await getCalendarEvents()

  return (
    <div className="pt-8">
      <div className="container-rs-wide py-8">
        <p className="section-label mb-3">{t('calendar.label')}</p>
        <h1 className="display-title mb-4">{t('calendar.title')}</h1>
        <p className="text-rs-muted max-w-xl mb-8">
          {t('calendar.intro')}
        </p>

        {/* Interactive calendar (client component) */}
        <CalendarClient lang={lang} events={events} />
      </div>
    </div>
  )
}
