import { getCalendarEvents } from '@/lib/sheets'
import { buildIcs, icsFilename, type IcsEvent } from '@/lib/ics'
import { SITE_URL } from '@/lib/i18n/seo'

/**
 * The whole broadcast schedule as a subscribable calendar.
 *
 * Subscribe once — `webcal://racespot.tv/schedule.ics` — and every future
 * broadcast turns up in your own calendar with a fifteen-minute alarm, kept
 * current without anyone signing up for anything. No address changes hands,
 * so there is nothing to consent to, nothing to store and nothing to delete.
 *
 * The `.ics` in the route name is deliberate: several clients decide what a
 * URL is by looking at its ending rather than its content type. It also keeps
 * the file out of the proxy's language rewriting, whose matcher skips
 * anything with an extension other than .xml or .txt.
 */

/** Same as the calendar page: the sheet is the source and it moves slowly. */
export const revalidate = 300

/** Past broadcasts stay in for a while — a calendar is also a record. */
const KEEP_PAST_DAYS = 60

/**
 * `?series=<exact name>` narrows the feed to one series. The name is matched
 * as the Master Schedule spells it, season included, so a finished season's
 * feed goes quietly empty instead of guessing at its successor. An empty
 * calendar is still a valid calendar — no 404, the client keeps refreshing.
 */
export async function GET(request: Request) {
  const series = new URL(request.url).searchParams.get('series')?.trim() || null
  const events = await getCalendarEvents()
  const floor = Date.now() - KEEP_PAST_DAYS * 86_400_000

  const entries: IcsEvent[] = events
    .filter((e) => {
      if (series && e.series !== series) return false
      const t = Date.parse(e.dateISO)
      return Number.isFinite(t) && t > floor && Number.isFinite(Date.parse(e.endDateISO))
    })
    .map((e) => ({
      id: e.id,
      title: e.series,
      description: e.description,
      start: e.dateISO,
      end: e.endDateISO,
      // English deliberately: a calendar subscription outlives the language
      // someone happened to be browsing in when they subscribed.
      url: `${SITE_URL}/en/live`,
    }))

  const body = buildIcs(entries, { name: series ?? 'Racespot Broadcasts', refreshHours: 6 })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${series ? icsFilename(series) : 'racespot-schedule.ics'}"`,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
