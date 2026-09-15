'use client'

import { getT, type Lang } from '@/lib/i18n'

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-rs-live text-white text-[11px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
      LIVE
    </span>
  )
}

export function EmptyState({ lang }: { lang: Lang }) {
  const t = getT(lang)
  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4">📅</div>
      <h3 className="text-rs-white font-display text-lg mb-2">{t('calendar.noEvents')}</h3>
      <p className="text-rs-muted text-sm max-w-md mx-auto">
        {t('calendar.noEventsDesc')}
      </p>
    </div>
  )
}
