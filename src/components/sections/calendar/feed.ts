/**
 * Addresses of the subscribable schedule.
 *
 * `webcal://` hands the feed straight to Apple Calendar, Outlook and most
 * desktop clients. Google Calendar wants the address pasted into
 * "Other calendars → From URL" — it accepts webcal there too — which is why
 * the button's tooltip points at right-click → copy link rather than offering
 * a copy button of its own.
 */
export const FEED_WEBCAL = 'webcal://racespot.tv/schedule.ics'

/**
 * One series only. The name is the exact string the Master Schedule carries,
 * season included ("Radical e-Cup - 2026 Season 4"), so a subscription ends
 * with the season — the feed for a finished series simply goes empty rather
 * than guessing which new name is its successor.
 */
export function seriesFeedUrl(series: string): string {
  return `${FEED_WEBCAL}?series=${encodeURIComponent(series)}`
}
