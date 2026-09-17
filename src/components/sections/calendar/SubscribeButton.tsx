'use client'

import type { TranslationKey } from '@/lib/i18n/translations'
import { Tip } from '@/components/ui/Tip'
import { FEED_WEBCAL } from './feed'

/**
 * The one-line way to subscribe to the whole schedule.
 *
 * A single button above the calendar; the explanation lives in a hover tip.
 * There is no copy button any more: right-click → copy link is what every
 * browser offers on a link, and the tip says so for the Google Calendar case.
 */
export function SubscribeButton({ t }: { t: (k: TranslationKey) => string }) {
  return (
    <Tip
      content={
        <>
          <p className="mb-1.5 text-white">{t('calendar.subscribeHint')}</p>
          <p>{t('calendar.subscribeCopyHint')}</p>
        </>
      }
    >
      <a
        href={FEED_WEBCAL}
        className="btn-outline btn-sm whitespace-nowrap px-3 sm:px-5"
        aria-label={t('calendar.subscribe')}
        title={t('calendar.subscribe')}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="2" y="3" width="12" height="11" rx="1.5" />
          <path d="M2 6.5h12M5.5 1.5V4M10.5 1.5V4" strokeLinecap="round" />
          <path d="M6 10.5h4M8 8.5v4" strokeLinecap="round" />
        </svg>
        {/* On a phone the icon alone: the row holds the view toggle and the timezone too */}
        <span className="hidden sm:inline">{t('calendar.subscribe')}</span>
      </a>
    </Tip>
  )
}
