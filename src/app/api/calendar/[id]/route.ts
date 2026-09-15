import { getCalendarEvents } from '@/lib/sheets'
import { buildIcs, icsFilename, type IcsEvent } from '@/lib/ics'
import { SITE_URL } from '@/lib/i18n/seo'
import { isLang, DEFAULT_LANG } from '@/lib/i18n/langs'

/**
 * One broadcast as a calendar file.
 *
 * The download carries a fifteen-minute alarm, so "remind me" is answered by
 * the reader's own calendar — no address, no list, no consent to record. The
 * subscribable version of the same thing is /schedule.ics.
 *
 * `?lang=de` only decides which language the link inside the entry points at;
 * it has no effect on the event itself.
 */

export const revalidate = 300

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const events = await getCalendarEvents()
  const event = events.find((e) => e.id === id)

  if (!event) {
    return new Response('Not found', { status: 404 })
  }
  if (!Number.isFinite(Date.parse(event.dateISO)) || !Number.isFinite(Date.parse(event.endDateISO))) {
    return new Response('Event has no usable times', { status: 422 })
  }

  const requested = new URL(request.url).searchParams.get('lang')
  const lang = isLang(requested) ? requested : DEFAULT_LANG

  const entry: IcsEvent = {
    id: event.id,
    title: event.series,
    description: event.description,
    start: event.dateISO,
    end: event.endDateISO,
    url: `${SITE_URL}/${lang}/live`,
  }

  return new Response(buildIcs([entry]), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${icsFilename(event.series)}"`,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
