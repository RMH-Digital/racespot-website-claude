import { Ticker } from './Ticker'
import type { TickerItem } from './Ticker'
import { getUpcomingEvents, toCalendarEvent } from '@/lib/sheets'
import { withReplays } from '@/lib/replays'
import { getT, type Lang } from '@/lib/i18n'

/** Fallback items when no data is available */
function fallbackItems(lang: Lang): TickerItem[] {
  const t = getT(lang)
  return [{ label: t('ticker.fb1') }, { label: t('ticker.fb2') }, { label: t('ticker.fb3') }]
}

export async function TickerServer({ lang }: { lang: Lang }) {
  const tickerItems: TickerItem[] = []

  try {
    const events = await getUpcomingEvents(5)

    // Add live event titles from Sheets
    const liveEvents = events.filter(e => e.isLive)
    for (const event of liveEvents) {
      tickerItems.push({
        label: `${event.series}${event.description ? ` — ${event.description}` : ''}`,
      })
    }

    // Add upcoming events — pass ISO date so Ticker can format in user's local
    // timezone, and the event itself for the small calendar menu beside it.
    const upcoming = events.filter(e => e.isUpcoming).slice(0, 3)
    const withVideo = await withReplays(upcoming.map(toCalendarEvent))
    for (const event of withVideo) {
      tickerItems.push({
        label: `${event.series}`,
        dateISO: event.dateISO,
        event,
      })
    }
  } catch (error) {
    console.error('Ticker data fetch error:', error)
  }

  // Use fallback if no items generated
  const items = tickerItems.length > 0 ? tickerItems : fallbackItems(lang)

  return <Ticker lang={lang} items={items} />
}
