'use client'

import { useRef, type ReactNode } from 'react'

/**
 * The hidden door to the team's feedback tool, around the copyright line in
 * the footer: a right-click (desktop), or five clicks/taps within three
 * seconds (phones — iOS has no right-click), lead to /intern, which forwards
 * to the sign-in on analytics.racespot.tv. Nothing visible, nothing stored,
 * no request before that.
 */
function open() {
  // A full navigation on purpose: /intern is a route handler that
  // redirects to another origin; the client router cannot follow it.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/intern?back=${encodeURIComponent(location.pathname)}`
}

export function SecretDoor({ children }: { children: ReactNode }) {
  const clicks = useRef<number[]>([])
  return (
    <span
      onContextMenu={(e) => {
        e.preventDefault()
        open()
      }}
      onClick={() => {
        const now = Date.now()
        clicks.current = [...clicks.current.filter((t) => now - t < 3000), now]
        if (clicks.current.length >= 5) {
          clicks.current = []
          open()
        }
      }}
    >
      {children}
    </span>
  )
}
