'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getT, type Lang } from '@/lib/i18n'

const FEED_HTTPS = 'https://racespot.tv/schedule.ics'
const FEED_WEBCAL = 'webcal://racespot.tv/schedule.ics'

/**
 * Subscribe to the broadcast schedule.
 *
 * Two buttons, because there is no single link that works everywhere:
 * `webcal://` hands the feed straight to Apple Calendar, Outlook and most
 * desktop clients, but a browser with no handler for it does nothing at all
 * and the reader is left wondering. So the https address is offered beside it
 * for pasting — which is what Google Calendar wants anyway ("Other calendars
 * → From URL").
 *
 * This is the reminder feature in its cheapest honest form: the alarm is in
 * the file, raised by the reader's own calendar. No address, no list, nothing
 * stored, nothing to consent to. The email variant is written up in
 * docs/TODO.md along with what it would actually cost.
 */
export function SubscribeSchedule({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FEED_HTTPS)
    } catch {
      // Clipboard access can be refused; the address is visible below either way.
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div className="rounded-rs border border-rs-border bg-rs-dark px-5 py-4 md:px-6 md:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="section-label mb-1.5">{t('calendar.subscribe')}</p>
          <p className="text-rs-muted text-sm leading-relaxed">{t('calendar.subscribeHint')}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <a href={FEED_WEBCAL} className="btn-primary btn-sm">
            {t('calendar.subscribe')}
          </a>
          <button type="button" onClick={copy} className="btn-outline btn-sm">
            {copied ? t('calendar.copied') : t('calendar.copyLink')}
          </button>
        </div>
      </div>

      {/* Spelled out, so someone who cannot use either button can still type
          it into their calendar by hand. */}
      <p className="mt-3 font-mono text-[11px] text-rs-muted break-all">{FEED_HTTPS}</p>
    </div>
  )
}
