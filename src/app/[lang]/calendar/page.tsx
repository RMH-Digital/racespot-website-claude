import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import { getCalendarEvents } from '@/lib/sheets'
import { CalendarClient } from '@/components/sections/CalendarClient'
import { getT, type Lang } from '@/lib/i18n'

/* Refresh calendar data every 5 minutes */
export const revalidate = 300

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return staticPageMetadata(lang, '/calendar', 'calendar', '/og-calendar.jpg')
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
