'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { YouTubeLiveStream } from '@/lib/youtube-utils'

interface LiveStatus {
  liveStreams: YouTubeLiveStream[]
  liveCount: number
  isLive: boolean
  /** false until the first /api/live-streams poll has returned */
  loaded: boolean
  /** When the last poll returned (ms since epoch); 0 before the first. The
   *  calendar uses it as its clock so "live" only changes when the poll does. */
  polledAt: number
  /** Schedule row id → the stream that row is on air with (lib/liveRows.ts) */
  liveRows: Record<string, string>
  /** Schedule row id → its Live Timing room ("Racespot2"), for rows on air that have one */
  liveTiming: Record<string, string>
}

const NO_ROWS: Record<string, string> = {}

const LiveStatusContext = createContext<LiveStatus>({
  liveStreams: [],
  liveCount: 0,
  isLive: false,
  loaded: false,
  polledAt: 0,
  liveRows: NO_ROWS,
  liveTiming: NO_ROWS,
})

export function useLiveStatus() {
  return useContext(LiveStatusContext)
}

const POLL_INTERVAL = 60_000 // 60 seconds
/** Coming back to the tab polls at once — unless the last poll is this fresh */
const REFRESH_ON_RETURN_MS = 15_000

/** Same streams, same viewer counts: nothing for anyone to re-render */
function sameRows(a: Record<string, string>, b: Record<string, string>): boolean {
  const ka = Object.keys(a)
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k])
}

function sameStreams(a: YouTubeLiveStream[], b: YouTubeLiveStream[]): boolean {
  return a.length === b.length && a.every((s, i) => s.id === b[i].id && s.concurrentViewers === b[i].concurrentViewers && s.title === b[i].title)
}

export function LiveStatusProvider({
  children,
  initialLiveCount = 0,
}: {
  children: React.ReactNode
  initialLiveCount?: number
}) {
  const [liveStreams, setLiveStreams] = useState<YouTubeLiveStream[]>([])
  const [liveCount, setLiveCount] = useState(initialLiveCount)
  const [loaded, setLoaded] = useState(false)
  const [polledAt, setPolledAt] = useState(0)
  const [liveRows, setLiveRows] = useState<Record<string, string>>(NO_ROWS)
  const [liveTiming, setLiveTiming] = useState<Record<string, string>>(NO_ROWS)

  // Polls can overlap (a return to the tab while the interval fires); only
  // the newest one may write, or an older answer overwrites a newer one.
  const seq = useRef(0)
  const lastPoll = useRef(0)

  const poll = useCallback(async () => {
    const mine = ++seq.current
    lastPoll.current = Date.now()
    try {
      const res = await fetch('/api/live-streams')
      if (!res.ok || mine !== seq.current) return
      const data = await res.json()
      if (mine !== seq.current) return
      const streams: YouTubeLiveStream[] = data.streams || []
      setLiveStreams((prev) => (sameStreams(prev, streams) ? prev : streams))
      setLiveCount(streams.length)
      const rows: Record<string, string> = data.rows || NO_ROWS
      setLiveRows((prev) => (sameRows(prev, rows) ? prev : rows))
      const timing: Record<string, string> = data.timing || NO_ROWS
      setLiveTiming((prev) => (sameRows(prev, timing) ? prev : timing))
      setLoaded(true)
      setPolledAt(Date.now())
    } catch {
      // Silently ignore poll errors
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    poll()

    // Only poll while the tab is actually being looked at. A forgotten tab was
    // asking the server sixty times an hour for a status nobody could see; now
    // it goes quiet when hidden and catches up the moment it comes back.
    let interval: ReturnType<typeof setInterval> | undefined

    function start() {
      if (interval) return
      interval = setInterval(poll, POLL_INTERVAL)
    }
    function stop() {
      if (!interval) return
      clearInterval(interval)
      interval = undefined
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastPoll.current > REFRESH_ON_RETURN_MS) poll()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [poll])

  const value = useMemo(
    () => ({ liveStreams, liveCount, isLive: liveCount > 0, loaded, polledAt, liveRows, liveTiming }),
    [liveStreams, liveCount, loaded, polledAt, liveRows, liveTiming],
  )

  return (
    <LiveStatusContext.Provider value={value}>
      {children}
    </LiveStatusContext.Provider>
  )
}

/** The Live Timing room of the row a stream belongs to, if it has one */
export function useStreamTiming(streamId: string | undefined): string | null {
  const { liveRows, liveTiming } = useLiveStatus()
  if (!streamId) return null
  for (const [row, stream] of Object.entries(liveRows)) {
    if (stream === streamId && liveTiming[row]) return liveTiming[row]
  }
  return null
}
