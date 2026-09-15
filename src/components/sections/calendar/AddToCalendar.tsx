'use client'

import type { CalendarEvent } from '@/lib/sheets'
import type { Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

/**
 * Download one broadcast as a calendar entry.
 *
 * The file carries an alarm, so the reminder is raised by the reader's own
 * calendar — we store nothing and ask for nothing. `download` keeps the
 * browser from trying to display the file, and `stopPropagation` keeps the
 * click off the row link underneath it.
 */
export function AddToCalendar({
  lang,
  event,
  t,
  compact = false,
}: {
  lang: Lang
  event: CalendarEvent
  t: (k: TranslationKey) => string
  compact?: boolean
}) {
  return (
    <a
      href={`/api/calendar/${encodeURIComponent(event.id)}?lang=${lang}`}
      download
      onClick={(e) => e.stopPropagation()}
      title={`${t('calendar.addToCalendar')} — ${t('calendar.reminderNote')}`}
      aria-label={`${t('calendar.addToCalendar')}: ${event.series}`}
      className={`relative z-10 flex shrink-0 items-center justify-center rounded-rs transition-colors
        ${compact
          ? // 24px: the month grid's cells are ~97px wide, so the 44px target
            // used everywhere else simply does not fit. 24 is the floor WCAG
            // 2.2 sets, and the same size the event dots settled on.
            'h-6 w-6 text-rs-muted hover:text-rs-yellow'
          : 'h-11 w-11 border border-rs-border text-rs-muted hover:border-rs-yellow hover:text-rs-yellow'}`}
    >
      <svg
        width={compact ? 13 : 16}
        height={compact ? 13 : 16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="2" y="3" width="12" height="11" rx="1.5" />
        <path d="M2 6.5h12M5.5 1.5V4M10.5 1.5V4" strokeLinecap="round" />
        <path d="M8 8.5v3.5M6.25 10.25 8 12l1.75-1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}
