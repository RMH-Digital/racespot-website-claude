'use client'

import { useState, useEffect } from 'react'
import { LOCALES, type Lang } from '@/lib/i18n'

/**
 * Rendering times in the visitor's timezone without a hydration mismatch.
 *
 * The problem: the server formats in UTC with no `navigator`, the browser
 * formats in the visitor's zone and locale. When the first client render
 * differs from the server HTML, React throws #418, discards the subtree and
 * rebuilds it.
 *
 * The fix here keeps content in the server HTML — which matters for indexing —
 * rather than blanking it until mount. Both sides render the *same*
 * deterministic string first: locale from the route, timezone pinned to UTC.
 * After mount the component re-renders in the visitor's real timezone, so the
 * times shift once, early, and nothing mismatches.
 *
 *   const { locale, timeZone, is24h } = useLocalFormat(lang)
 *   d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone })
 *
 * `timeZone` is 'UTC' before mount and undefined after — and undefined means
 * "the runtime's own zone" to Intl, which is exactly what we want.
 */

/** True once the component has mounted in the browser. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

/** Languages whose audience reads 24-hour time by default. English does not. */
const PREFERS_24H: Record<Lang, boolean> = {
  en: false,
  de: true,
  es: true,
  pt: true,
  fr: true,
  it: true,
}

export interface LocalFormat {
  /** Derived from the route, never from `navigator` — deterministic. */
  locale: string
  /** 'UTC' until mounted, then undefined (= the visitor's own zone). */
  timeZone: string | undefined
  is24h: boolean
  mounted: boolean
}

export function useLocalFormat(lang: Lang): LocalFormat {
  const mounted = useMounted()
  const [is24h, setIs24h] = useState<boolean>(() => PREFERS_24H[lang] ?? true)

  useEffect(() => {
    // Refine from the browser, once we are allowed to differ from the server.
    try {
      const resolved = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions()
      if (typeof resolved.hour12 === 'boolean') setIs24h(!resolved.hour12)
    } catch {
      /* keep the language default */
    }
  }, [lang])

  return {
    locale: LOCALES[lang],
    timeZone: mounted ? undefined : 'UTC',
    is24h,
    mounted,
  }
}
