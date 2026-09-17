'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { CalendarEvent } from '@/lib/sheets'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'

/**
 * One answer to "is this broadcast live?" for the whole calendar.
 *
 * Two sources disagree by design. The Master Schedule only knows the plan:
 * its `isLive` is "between the scheduled start and ninety minutes after the
 * scheduled end", computed when the page was rendered — up to five minutes
 * ago — and it stays true long after a stream that ended early has gone dark.
 * YouTube knows what is actually on air, polled every minute by
 * LiveStatusProvider. The header, hero and ticker already listen to YouTube;
 * the calendar used the sheet, so a badge could say LIVE while the header did
 * not. This reconciles them:
 *
 * - before the scheduled start → upcoming
 * - inside the window and YouTube is live → live
 * - inside the window and YouTube is not live → upcoming for the first
 *   fifteen minutes after the start (it is starting late), past after that
 *   (it finished early)
 * - after the window → past
 *
 * The clock is the moment of the last poll — never later than a minute old —
 * so a stream that ended ten minutes ago is past even on a page rendered
 * before it ended, and nothing in render reads the wall clock. Before mount — on the server and
 * for the first client render — the sheet's flags are used unchanged, so both
 * renders agree and nothing flickers on hydration.
 */
export interface EventStatus {
  live: boolean
  past: boolean
  upcoming: boolean
}

const OVERTIME_MS = 90 * 60 * 1000
const LATE_START_GRACE_MS = 15 * 60 * 1000

export function eventStatus(e: CalendarEvent, youtubeLive: boolean, now: number): EventStatus {
  const start = Date.parse(e.dateISO)
  const end = Date.parse(e.endDateISO)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return fromFlags(e)
  if (now < start) return { live: false, past: false, upcoming: true }
  if (now > end + OVERTIME_MS) return { live: false, past: true, upcoming: false }
  if (youtubeLive) return { live: true, past: false, upcoming: false }
  // In the window with nothing on air: a few minutes after the scheduled start
  // it may still be about to begin — after that it has ended early. Streams
  // run short far more often than they start late.
  const past = now > start + LATE_START_GRACE_MS
  return { live: false, past, upcoming: !past }
}

function fromFlags(e: CalendarEvent): EventStatus {
  return { live: e.isLive, past: e.isPast, upcoming: !e.isLive && !e.isPast }
}

const subscribeNoop = () => () => {}

/** Returns a function that classifies any event with the current YouTube state and clock. */
export function useEventStatus(): (e: CalendarEvent) => EventStatus {
  const { isLive, loaded, polledAt } = useLiveStatus()
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false)
  // Re-created whenever the poll updates, so every consumer re-renders with
  // the same answer at the same moment.
  return useCallback(
    (e: CalendarEvent) => (mounted && loaded ? eventStatus(e, isLive, polledAt) : fromFlags(e)),
    [mounted, loaded, isLive, polledAt],
  )
}
