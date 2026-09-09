'use client'

import { useState, useEffect } from 'react'

export interface CountdownValues {
  days: number
  hours: number
  mins: number
  secs: number
}

export function useCountdown(targetDate: string): CountdownValues {
  const [timeLeft, setTimeLeft] = useState<CountdownValues>({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        // Show zeros once the target has passed instead of freezing on the
        // last positive tick (previously the state was simply never updated).
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}
