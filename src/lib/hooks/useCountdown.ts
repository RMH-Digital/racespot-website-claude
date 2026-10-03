'use client'

import { useState, useEffect } from 'react'

export interface CountdownValues {
  days: number
  hours: number
  mins: number
  secs: number
  /** false until the first tick on the client: the server cannot know the time left */
  ready: boolean
}

const ZERO: CountdownValues = { days: 0, hours: 0, mins: 0, secs: 0, ready: true }

export function useCountdown(targetDate: string): CountdownValues {
  const [timeLeft, setTimeLeft] = useState<CountdownValues>({ days: 0, hours: 0, mins: 0, secs: 0, ready: false })

  useEffect(() => {
    const target = new Date(targetDate).getTime()
    // No target, or one that has passed: zeros once, and no ticking. Until
    // 2026-10-02 an empty target ticked NaN into state every second, and a
    // passed one a fresh zero object — both re-rendered the page forever.
    if (!Number.isFinite(target) || target <= Date.now()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-off sync with the clock
      setTimeLeft(ZERO)
      return
    }
    function calc() {
      const diff = target - Date.now()
      if (diff <= 0) {
        setTimeLeft(ZERO)
        clearInterval(id)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
        ready: true,
      })
    }
    const id = setInterval(calc, 1000)
    calc()
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}
