'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/lib/language'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'

interface HeroProps {
  nextEventSeries?: string
  nextEventDateISO?: string
}

export function Hero({ nextEventSeries, nextEventDateISO }: HeroProps) {
  const t = useTranslation()
  const { liveStreams, isLive } = useLiveStatus()

  const liveTitles = liveStreams.map(s => s.title)
  const hasMultipleStreams = liveTitles.length > 1
  const singleTitle = liveTitles.length === 1 ? liveTitles[0] : null

  return (
    <section
      className="relative overflow-hidden
                 min-h-[480px] md:min-h-[560px] max-h-[860px]"
      style={{ height: 'calc(100svh - 98px)' }}
    >
      {/* Background image — a real <Image> (not CSS background) so the browser
          preloads it as the LCP element and the optimizer serves AVIF/WebP. */}
      <Image
        src="/images/hero-banner.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Dark overlay — mobile: heavier for readability, desktop: directional */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.9) 10%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.5) 70%, rgba(10,10,10,0.3) 100%)',
        }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,10,0.92) 30%, rgba(10,10,10,0.7) 55%, rgba(10,10,10,0.35) 100%)',
        }}
      />

      {/* Subtle yellow accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />

      {/* Content — vertically centred on all viewports */}
      <div className="container-rs relative z-10 h-full flex items-center">
        <div className="max-w-[700px]">
          {/* Live / Upcoming badge */}
          {isLive && hasMultipleStreams ? (
            <Link href="/live" className="flex flex-col gap-2 mb-5 md:mb-8 group">
              <div className="flex items-center gap-3">
                <span className="badge-live">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
                  {t('hero.liveNow')}
                </span>
                <span className="bg-rs-live/20 text-rs-live text-[11px] font-display font-bold px-2 py-0.5 rounded-full">
                  {liveTitles.length}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pl-0.5">
                {liveTitles.map((title, i) => (
                  <span key={i} className="text-white/60 text-sm group-hover:text-white transition-colors line-clamp-1">
                    {title}
                  </span>
                ))}
              </div>
            </Link>
          ) : isLive && singleTitle ? (
            <Link href="/live" className="flex items-center gap-3 mb-5 md:mb-8 group">
              <span className="badge-live">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
                {t('hero.liveNow')}
              </span>
              <span className="text-white/60 text-sm group-hover:text-white transition-colors line-clamp-1">{singleTitle}</span>
            </Link>
          ) : nextEventSeries ? (
            <Link href="/live" className="flex items-center gap-3 mb-5 md:mb-8 group">
              <span className="bg-rs-dark border border-rs-border text-white text-[11px] font-display font-bold uppercase tracking-wider px-3 py-1.5 rounded-rs flex items-center gap-1.5 shrink-0 group-hover:border-rs-yellow transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-rs-yellow" />
                {t('hero.nextBroadcast')}
              </span>
              <NextEventLabel series={nextEventSeries} dateISO={nextEventDateISO} />
            </Link>
          ) : null}

          {/* Main title */}
          <h1 className="font-display font-black uppercase text-white tracking-tight
                         text-[28px] leading-[0.95] md:text-display mb-3 md:mb-6">
            {t('hero.title.line1')}<br />
            {t('hero.title.line2')}<br />
            <em className="not-italic text-rs-yellow">{t('hero.title.line3')}</em><br />
            {t('hero.title.line4')}
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] md:text-[16px] text-white/65 max-w-[520px] mb-3 md:mb-4 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 md:gap-4">
            {isLive ? (
              <Link href="/live" className="btn-primary">
                ▶ {t('hero.watchLive')}
              </Link>
            ) : (
              <Link href="/broadcasts" className="btn-primary">
                {t('hero.watchBroadcasts')}
              </Link>
            )}
            <Link href="/calendar" className="btn-outline">
              {t('hero.viewSchedule')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Client-rendered next event label with local time */
function NextEventLabel({ series, dateISO }: { series: string; dateISO?: string }) {
  if (!dateISO) return <span className="text-white/60 text-sm line-clamp-1">{series}</span>

  return (
    <span className="text-white/60 text-sm line-clamp-1">
      {series}
      <LocalTime dateISO={dateISO} />
    </span>
  )
}

/** Renders localised time (client-side only) */
function LocalTime({ dateISO }: { dateISO: string }) {
  const d = new Date(dateISO)

  let timeStr = ''
  try {
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'
    const weekday = d.toLocaleDateString(locale, { weekday: 'short' })
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    timeStr = ` · ${weekday} ${time}`
  } catch {
    timeStr = ''
  }

  return <>{timeStr}</>
}
