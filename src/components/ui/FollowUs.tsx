'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { getT, type Lang } from '@/lib/i18n'
import { SOCIAL, YOUTUBE_SUBSCRIBE_URL, YouTubeIcon } from '@/lib/socials'

/**
 * "Subscribe on YouTube", and quietly beside it, everywhere else we are.
 *
 * The subscribe button is a plain link with `sub_confirmation=1`: YouTube
 * itself asks "Subscribe to RaceSpotTV?" when it opens, so we get the effect
 * of Google's subscribe widget without loading Google's script on our page.
 * The other five channels sit behind one unassuming "More channels" button —
 * a chooser, not a row of icons competing with the content. Both leave the
 * site, deliberately, in a new tab.
 */
export function FollowUs({ lang, className = '', dropUp = false, size = 'sm', compact = false }: { lang: Lang; className?: string; dropUp?: boolean; size?: 'sm' | 'md'; compact?: boolean }) {
  const sm = size === 'sm' ? 'btn-sm' : ''
  const t = getT(lang)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation() // the player dialog listens for Escape too; one press, one close
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  return (
    <div ref={root} className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={YOUTUBE_SUBSCRIBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-primary ${sm} whitespace-nowrap`}
      >
        <YouTubeIcon size={15} />
        {t('social.subscribeYouTube')}
      </a>

      <div className="relative">
        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={compact ? t('social.moreChannels') : undefined}
          title={compact ? t('social.moreChannels') : undefined}
          className={compact
            // Icon only, for a row that already has enough words in it.
            ? 'flex h-11 w-11 items-center justify-center rounded-rs border border-rs-border text-rs-muted transition-colors hover:border-rs-yellow hover:text-rs-yellow'
            : `btn-outline ${sm} whitespace-nowrap`}
        >
          {compact ? (
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" />
            </svg>
          ) : (
            <>
              {t('social.moreChannels')}
              <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" aria-hidden="true" className={`transition-transform ${open !== dropUp ? 'rotate-180' : ''}`}>
                <path d="M4 5L0 0h8L4 5z" />
              </svg>
            </>
          )}
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            className={`absolute z-[95] w-60 overflow-hidden ${compact ? 'left-0' : 'right-0'} rounded-rs border border-rs-border bg-rs-dark text-left shadow-xl
              ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          >
            <p className="px-4 pb-2 pt-3 text-[11px] leading-snug text-rs-muted">{t('social.followHint')}</p>
            {SOCIAL.filter((s) => s.key !== 'youtube').map((s) => (
              <a
                key={s.key}
                role="menuitem"
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white transition-colors hover:bg-rs-gray focus-visible:bg-rs-gray"
              >
                <span className="text-rs-muted">{s.icon}</span>
                {s.label}
                <span className="ml-auto text-rs-muted" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
