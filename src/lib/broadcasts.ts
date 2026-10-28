import 'server-only'
import { getCalendarEvents } from './sheets'
import { withReplays } from './replays'

/**
 * Our past broadcasts that have a recording — what /api/broadcasts serves.
 *
 * The Press Tool reads it to set an article's `broadcast` field (series and
 * day of the article against these, exactly one match or nothing), so the
 * pairing of a schedule row with its YouTube recording exists once, here in
 * replays.ts, and not a second time in the pipeline.
 *
 * withReplays() gets the same list the calendar page gives it, all public
 * rows of the last year: its first pass settles the best pairings across the
 * whole list, so a row matched on its own could take a recording the
 * calendar gives to its neighbour. Same input, same answer. Both reads are
 * the module memos the calendar already fills — no YouTube call of its own.
 */
export interface PastBroadcast {
  id: string
  series: string
  description: string
  dateISO: string
  endDateISO: string
  videoId: string
  videoParts?: string[]
  offChannel?: boolean
}

export async function pastBroadcasts(): Promise<PastBroadcast[]> {
  const events = await withReplays(await getCalendarEvents())
  return events
    .filter((e) => e.isPast && e.videoId)
    .map((e) => ({
      id: e.id,
      series: e.series,
      description: e.description,
      dateISO: e.dateISO,
      endDateISO: e.endDateISO,
      videoId: e.videoId!,
      ...(e.videoParts ? { videoParts: e.videoParts } : {}),
      ...(e.offChannel ? { offChannel: true } : {}),
    }))
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
}
