'use client'

import { useEffect } from 'react'

/**
 * Feedback button for the Racespot team (Feedback-Werkstatt in Racespot
 * Analytics, ~/Racespot Analytics/docs/FEEDBACK.md): mark a spot on the page,
 * write what should change; Claude plans it, an approver decides, a second
 * click ships it.
 *
 * Hidden on purpose. Visitors load nothing and store nothing. The widget is
 * only fetched when this device holds an unlock proof, and that exists only
 * after a team member signed in on analytics.racespot.tv via the hidden door
 * (/intern, or a right-click / five taps on the copyright line in the
 * footer — SecretDoor). The hub sends the proof back as #rsfb=…; the widget keeps it
 * in localStorage (`rsfb`), checks it with the hub and drops it when it is
 * invalid or expired (30 days). Privacy policy section 4 names it.
 */
export const FEEDBACK_HUB = process.env.NEXT_PUBLIC_FEEDBACK_HUB || 'https://analytics.racespot.tv'
const PROOF = /^[A-Za-z0-9_-]{10,600}\.[A-Za-z0-9_-]{43}$/

function unlocked(): boolean {
  if (location.hash.startsWith('#rsfb=')) return true
  try {
    return PROOF.test(localStorage.getItem('rsfb') ?? '')
  } catch {
    return false
  }
}

export function FeedbackLoader() {
  useEffect(() => {
    if (!unlocked() || document.querySelector('script[data-rsfb-loader]')) return
    const s = document.createElement('script')
    s.src = `${FEEDBACK_HUB}/feedback/widget.js`
    s.dataset.project = 'website'
    s.dataset.rsfbLoader = ''
    document.body.appendChild(s)
  }, [])
  return null
}
