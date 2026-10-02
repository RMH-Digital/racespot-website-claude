'use client'

import { useEffect } from 'react'

/**
 * Feedback button for the Racespot team (Feedback-Werkstatt in Racespot
 * Analytics, ~/Racespot Analytics/docs/FEEDBACK.md): mark a spot on the page,
 * write what should change; Claude plans it, an approver decides, a second
 * click ships it.
 *
 * Hidden on purpose. Visitors load nothing and store nothing: the widget
 * script is only fetched once someone opens a page with #feedback, and from
 * then on only on that device (localStorage `rsfb=1`, removed again with the
 * button's "Aus"). The privacy policy names it (legal/privacy.ts, section 4).
 * The widget sends nothing itself — it opens a window on analytics.racespot.tv,
 * where the team member is signed in, and hands the marked spot over.
 */
const WIDGET = process.env.NEXT_PUBLIC_FEEDBACK_WIDGET || 'https://analytics.racespot.tv/feedback/widget.js'

function unlocked(): boolean {
  if (location.hash === '#feedback') return true
  try {
    return localStorage.getItem('rsfb') === '1'
  } catch {
    return false
  }
}

function load() {
  if (document.querySelector('script[data-rsfb-loader]')) return
  const s = document.createElement('script')
  s.src = WIDGET
  s.defer = true
  s.dataset.project = 'website'
  s.dataset.rsfbLoader = ''
  document.body.appendChild(s)
}

export function FeedbackLoader() {
  useEffect(() => {
    if (unlocked()) load()
    const onHash = () => location.hash === '#feedback' && load()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return null
}
