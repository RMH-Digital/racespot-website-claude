'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/lib/i18n'

/**
 * Everything the calendar needs to say what time it is.
 *
 * Split out of CalendarClient.tsx on 2026-09-15, when that file reached 755
 * lines. This half is pure date arithmetic and locale resolution and has no
 * markup in it, which makes it the cleanest seam in the component.
 */

// ─── Locale & time-format resolution ────────────────────────
// Maps the site's selected language to a default locale + 24h preference.
// The browser's region (e.g. "de-AT", "en-GB", "pt-BR") can override if it
// belongs to the same language family, giving regionally correct formatting.

const LANG_DEFAULTS: Record<string, { locale: string; is24h: boolean }> = {
  de: { locale: 'de-DE', is24h: true },    // Germany, Austria, Switzerland — always 24h
  en: { locale: 'en-US', is24h: false },    // US English — 12h default
  fr: { locale: 'fr-FR', is24h: true },     // France — 24h
  es: { locale: 'es-ES', is24h: true },     // Spain — 24h
  pt: { locale: 'pt-BR', is24h: true },     // Brazil — the site's Portuguese is pt-BR; 24h
  it: { locale: 'it-IT', is24h: true },     // Italy — 24h
}

// Regions where 12-hour time is the norm (even if the language default is 24h)
const REGIONS_12H = new Set([
  'US', 'PH', 'MY', 'AU', 'CA', 'NZ', 'IN', 'EG', 'SA', 'CO', 'PK', 'BD',
])

function resolveLocaleAndFormat(siteLang: Lang): { locale: string; is24h: boolean } {
  const defaults = LANG_DEFAULTS[siteLang] || LANG_DEFAULTS.en

  if (typeof navigator === 'undefined') return defaults

  // Try to find a browser locale that matches the site language
  const browserLocales = navigator.languages || [navigator.language]
  let matchedLocale: string | null = null
  let region: string | null = null

  for (const bl of browserLocales) {
    const parts = bl.split('-')
    const lang = parts[0].toLowerCase()
    if (lang === siteLang) {
      matchedLocale = bl
      region = parts[1]?.toUpperCase() || null
      break
    }
  }

  // If no browser locale matches the site language, use the language default
  const locale = matchedLocale || defaults.locale

  // Determine 24h: start with the language default, then check if the user's
  // region is known to use 12h (e.g. en-AU → 12h, en-GB → 24h)
  let is24h = defaults.is24h

  if (region) {
    if (REGIONS_12H.has(region)) {
      is24h = false
    } else if (!defaults.is24h) {
      // If language default is 12h (English), check if region uses 24h
      // e.g. en-GB, en-DE → 24h
      if (!REGIONS_12H.has(region) && region !== 'US') {
        // Use Intl to detect for this specific locale
        try {
          const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
          is24h = !resolved.hour12
        } catch {
          // keep default
        }
      }
    }
  }

  return { locale, is24h }
}

/**
 * Locale, 12/24-hour preference and timezone for the calendar.
 *
 * Both the format *and* the grouping depend on the timezone here: which day a
 * 00:30 UTC race belongs to differs between UTC and Europe/Berlin, so it is not
 * enough to gate the formatting. Until the component has mounted, everything
 * resolves in **UTC** — deterministic on server and client alike — and only
 * afterwards switches to the visitor's own zone. Without that, server HTML and
 * first client render disagree and React reports a hydration mismatch (#418).
 */
export function useLocaleFormat(lang: Lang) {
  const [result, setResult] = useState<{ locale: string; is24h: boolean }>(() =>
    LANG_DEFAULTS[lang] || LANG_DEFAULTS.en
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setResult(resolveLocaleAndFormat(lang))
    setMounted(true)
  }, [lang])

  // undefined means "the runtime's own zone" to Intl and to our helpers.
  return { ...result, timeZone: mounted ? undefined : 'UTC', mounted }
}

/**
 * Calendar parts (year / month / day) of an instant **in a given zone**.
 * en-CA formats as YYYY-MM-DD, which parses without ambiguity.
 */
export function zonedParts(d: Date, timeZone: string | undefined): { year: number; month: number; day: number } {
  const [y, m, day] = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d).split('-').map(Number)
  return { year: y, month: m - 1, day }
}

// ─── Helpers ────────────────────────────────────────────────

export function localDate(iso: string) {
  return new Date(iso)
}

export function formatTime(iso: string, is24h: boolean, locale: string, timeZone?: string): string {
  const d = localDate(iso)
  try {
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24h,
      timeZone,
    })
  } catch {
    const h = d.getHours()
    const m = String(d.getMinutes()).padStart(2, '0')
    if (is24h) return `${String(h).padStart(2, '0')}:${m}`
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${m} ${ampm}`
  }
}

export function formatWeekday(iso: string, locale: string, timeZone?: string): string {
  return localDate(iso).toLocaleDateString(locale, { weekday: 'short', timeZone })
}

export function getWeekdayNames(locale: string): string[] {
  // Generate localized weekday abbreviations starting from Sunday
  const names: string[] = []
  for (let i = 0; i < 7; i++) {
    // Jan 4 2026 is a Sunday
    const d = new Date(2026, 0, 4 + i)
    names.push(d.toLocaleDateString(locale, { weekday: 'short' }))
  }
  return names
}

export function getMonthKey(iso: string, timeZone?: string): string {
  const { year, month } = zonedParts(localDate(iso), timeZone)
  return `${year}-${String(month).padStart(2, '0')}`
}

export function getMonthLabel(key: string, locale: string): string {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month, 1)
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}
