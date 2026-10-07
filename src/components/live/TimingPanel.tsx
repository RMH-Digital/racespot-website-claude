'use client'

import { useCallback, useState } from 'react'
import { getT, type Lang } from '@/lib/i18n'
import { TimingBoard } from './TimingBoard'

/**
 * Live Timing for one room: our own board first (TimingBoard), Appgineering's
 * page as the fallback.
 *
 * The fallback loads only after a click — it is a page from
 * timing.appgineering.com, and loading it hands the viewer's address to
 * them (privacy policy, live timing). Our board does not: the server fetches
 * the data. The link to their page is always there for anyone who wants it in
 * its own window.
 */
export function timingPageUrl(room: string) {
  return `https://timing.appgineering.com/rooms/${encodeURIComponent(room)}/timing`
}

export function TimingPanel({ room, size, lang }: { room: string; size: 'compact' | 'full'; lang: Lang }) {
  const t = getT(lang)
  const [ours, setOurs] = useState(true)
  const [theirs, setTheirs] = useState(false)
  const unavailable = useCallback(() => setOurs(false), [])

  return (
    <div className="flex h-full flex-col bg-rs-black">
      <div className="min-h-0 flex-1">
        {ours ? (
          <TimingBoard key={room} room={room} size={size} lang={lang} onUnavailable={unavailable} />
        ) : theirs ? (
          <iframe
            src={timingPageUrl(room)}
            title={t('timing.title')}
            className="h-full w-full"
            style={{ colorScheme: 'dark' }}
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="max-w-xs text-sm text-rs-muted">{t('timing.fallbackText')}</p>
            <button type="button" onClick={() => setTheirs(true)} data-track="timing-load-appgineering" className="btn-outline btn-sm">
              {t('timing.fallbackButton')}
            </button>
          </div>
        )}
      </div>
      <a
        href={timingPageUrl(room)}
        target="_blank"
        rel="noopener noreferrer"
        data-track="timing-open-appgineering"
        className="block border-t border-rs-border bg-rs-dark px-3 py-2 text-right text-[11px] text-rs-muted hover:text-rs-yellow"
      >
        {t('timing.openExternal')} ↗
      </a>
    </div>
  )
}
