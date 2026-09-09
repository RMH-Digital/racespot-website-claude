'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { YouTubeLiveStream } from '@/lib/youtube-utils'

interface LiveStatus {
  liveStreams: YouTubeLiveStream[]
  liveCount: number
  isLive: boolean
  /** false until the first /api/live-streams poll has returned */
  loaded: boolean
}

const LiveStatusContext = createContext<LiveStatus>({
  liveStreams: [],
  liveCount: 0,
  isLive: false,
  loaded: false,
})

export function useLiveStatus() {
  return useContext(LiveStatusContext)
}

const POLL_INTERVAL = 60_000 // 60 seconds

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

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/live-streams')
      if (!res.ok) return
      const data = await res.json()
      const streams: YouTubeLiveStream[] = data.streams || []
      setLiveStreams(streams)
      setLiveCount(streams.length)
      setLoaded(true)
    } catch {
      // Silently ignore poll errors
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    poll()
    const interval = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [poll])

  return (
    <LiveStatusContext.Provider value={{ liveStreams, liveCount, isLive: liveCount > 0, loaded }}>
      {children}
    </LiveStatusContext.Provider>
  )
}
