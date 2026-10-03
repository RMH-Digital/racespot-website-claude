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
 * LiveStatusProvider, and the server pairs each stream with its row
 * (lib/liveRows.ts). This reconciles them, row by row:
 *
 * - this row's stream is on air → live (also a few minutes early, or past
 *   the overtime buffer — the stream is the better witness)
 * - before the scheduled start → upcoming
 * - after the window → past
 * - a row that goes out on another channel (`offChannel`) → the schedule
 *   decides: live until its scheduled end, then past
 * - inside the window with no stream of its own → upcoming for the first
 *   fifteen minutes after the start (it is starting late), past after that
 *   (it finished early)
 *
 * Until 2026-10-03 the YouTube side was one switch for the channel: any
 * stream on air made every row inside its window live.
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

export function eventStatus(e: CalendarEvent, liveRows: Record<string, string>, now: number): EventStatus {
  if (liveRows[e.id]) return { live: true, past: false, upcoming: false }
  const start = Date.parse(e.dateISO)
  const end = Date.parse(e.endDateISO)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return fromFlags(e)
  if (now < start) return { live: false, past: false, upcoming: true }
  if (now > end + OVERTIME_MS) return { live: false, past: true, upcoming: false }
  if (e.offChannel) return now <= end ? { live: true, past: false, upcoming: false } : { live: false, past: true, upcoming: false }
  // In the window with nothing of its own on air: a few minutes after the
  // scheduled start it may still be about to begin — after that it has ended
  // early. Streams run short far more often than they start late.
  const past = now > start + LATE_START_GRACE_MS
  return { live: false, past, upcoming: !past }
}

function fromFlags(e: CalendarEvent): EventStatus {
  return { live: e.isLive, past: e.isPast, upcoming: !e.isLive && !e.isPast }
}

const subscribeNoop = () => () => {}

/** Returns a function that classifies any event with the current YouTube state and clock. */
export function useEventStatus(): (e: CalendarEvent) => EventStatus {
  const { liveRows, loaded, polledAt } = useLiveStatus()
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false)
  // Re-created whenever the poll updates, so every consumer re-renders with
  // the same answer at the same moment.
  return useCallback(
    (e: CalendarEvent) => (mounted && loaded ? eventStatus(e, liveRows, polledAt) : fromFlags(e)),
    [mounted, loaded, liveRows, polledAt],
  )
}
