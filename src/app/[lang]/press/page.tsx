import type { Metadata } from 'next'
import Link from 'next/link'
import { staticPageMetadata } from '@/lib/i18n/seo'
import { LOCALES, getT, localePath, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { getSiteStats, roundedDown } from '@/lib/stats'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return staticPageMetadata(lang, '/press', 'press', '/og-home.jpg')
}

const PRESS_MAIL = 'press@racespot.tv'

/**
 * The logos a journalist may download — the brand files as they exist
 * (content Website/Logo_font_etc, the same set the other Racespot projects
 * carry), renamed, nothing redrawn. No vector version exists yet: the SVGs
 * around only wrap these PNGs. Their yellow (#FFD305) is the print yellow of
 * the original files, not the site's #F5C000; left as it is.
 */
const LOGOS: { file: string; kind: 'wordmark' | 'mark'; colour: TranslationKey; tile: string }[] = [
  { file: 'racespot-wordmark-white.png',  kind: 'wordmark', colour: 'press.logo.white',    tile: 'bg-rs-black' },
  { file: 'racespot-wordmark-black.png',  kind: 'wordmark', colour: 'press.logo.black',    tile: 'bg-white' },
  { file: 'racespot-wordmark-yellow.png', kind: 'wordmark', colour: 'press.logo.yellow',   tile: 'bg-rs-black' },
  { file: 'racespot-r-white.png',         kind: 'mark',     colour: 'press.logo.white',    tile: 'bg-rs-black' },
  { file: 'racespot-r-black.png',         kind: 'mark',     colour: 'press.logo.black',    tile: 'bg-white' },
  { file: 'racespot-r-on-yellow.png',     kind: 'mark',     colour: 'press.logo.onYellow', tile: 'bg-rs-black' },
]

/**
 * /press — for editors and PR people: where to send press releases, what we
 * publish, the key figures (live from Racespot Analytics and the Master
 * Schedule, a figure without a source is left out) and the logos. The media
 * kit itself is not here — it is sent on request through the contact form.
 */
export default async function PressPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  const t = getT(lang)
  const locale = LOCALES[lang]
  const stats = await getSiteStats()
  const mailto = `mailto:${PRESS_MAIL}?subject=${encodeURIComponent(t('press.mailSubject'))}`

  const facts: { value: string; label: TranslationKey }[] = [
    { value: roundedDown(stats.broadcasts, locale, 10), label: 'stats.broadcastsLast12Months' },
    ...(stats.watchHours !== null ? [{ value: roundedDown(stats.watchHours, locale, 100), label: 'stats.hoursWatched' as TranslationKey }] : []),
    { value: roundedDown(stats.youtubeViews, locale), label: 'about.stat.ytViews' },
    { value: roundedDown(stats.followers, locale, 100), label: 'stats.followers' },
  ]

  return (
    <div>
      {/* Hero — the contact page's, so the two read as one family */}
      <div className="relative h-[200px] md:h-[260px] overflow-hidden bg-linear-to-b from-rs-dark to-rs-black">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3">{t('press.label')}</p>
            <h1 className="display-title">{t('press.title')}</h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-16 space-y-20">
        {/* Press list + key figures */}
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1.3fr_1fr] gap-12 md:gap-16">
          <div>
            <h2 className="font-display font-bold text-xl md:text-2xl uppercase text-white mb-4">{t('press.listTitle')}</h2>
            <p className="text-rs-muted leading-relaxed mb-8 max-w-xl">{t('press.listText')}</p>
            <a href={mailto} data-track="press-mail" className="btn-primary normal-case tracking-normal break-all">
              {PRESS_MAIL}
            </a>
            <p className="mt-8 border-l-[3px] border-rs-yellow pl-4 text-sm text-white/80 max-w-xl">{t('press.affiliate')}</p>
          </div>

          <div className="rounded-rs border border-rs-border bg-rs-dark p-6 md:p-8">
            <h2 className="text-[11px] font-display font-bold uppercase tracking-widest text-rs-muted mb-6">{t('press.factsTitle')}</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-7">
              {facts.map((f) => (
                <li key={f.label}>
                  <p className="font-display font-black text-rs-yellow text-2xl md:text-3xl leading-none tabular-nums">{f.value}</p>
                  <p className="text-xs text-rs-muted mt-2 leading-snug">{t(f.label)}</p>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-rs-muted mt-7">{t('press.factsNote')}</p>
          </div>
        </div>

        {/* What we publish */}
        <section aria-labelledby="press-publish" className="max-w-2xl">
          <h2 id="press-publish" className="font-display font-bold text-xl md:text-2xl uppercase text-white mb-4">{t('press.publishTitle')}</h2>
          <p className="text-rs-muted leading-relaxed mb-6">{t('press.publishText')}</p>
          <Link href={localePath(lang, '/news')} className="btn-ghost">{t('press.newsLink')} →</Link>
        </section>

        {/* Logos */}
        <section aria-labelledby="press-logos">
          <div className="section-header">
            <div>
              <h2 id="press-logos" className="font-display font-bold text-xl md:text-2xl uppercase text-white mb-2">{t('press.logosTitle')}</h2>
              <p className="text-rs-muted text-sm">{t('press.logosText')}</p>
            </div>
            <a href="/press/racespot-logos.zip" download data-track="press-logos-zip" className="btn-outline btn-sm">
              {t('press.logo.all')}
            </a>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LOGOS.map((l) => {
              const label = `${t(l.kind === 'wordmark' ? 'press.logo.wordmark' : 'press.logo.mark')}, ${t(l.colour)}`
              return (
                <li key={l.file}>
                  <a
                    href={`/press/${l.file}`}
                    download
                    data-track="press-logo"
                    className="group block overflow-hidden rounded-rs border border-rs-border transition-colors hover:border-rs-yellow"
                  >
                    <span className={`flex h-32 items-center justify-center p-6 ${l.tile}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- the file itself, as downloaded */}
                      <img
                        src={`/press/${l.file}`}
                        alt=""
                        width={l.kind === 'wordmark' ? 2968 : 1000}
                        height={l.kind === 'wordmark' ? 287 : 1000}
                        loading="lazy"
                        className={l.kind === 'wordmark' ? 'h-auto w-full max-w-[240px]' : 'h-16 w-16'}
                      />
                    </span>
                    <span className="flex items-center justify-between gap-3 bg-rs-dark px-4 py-3 text-sm">
                      <span className="text-white">{label}</span>
                      <span className="text-[11px] font-mono text-rs-muted group-hover:text-rs-yellow transition-colors">PNG ↓</span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Media kit on request */}
        <section aria-labelledby="press-media" className="rounded-rs border border-rs-border bg-linear-to-b from-rs-dark to-rs-black p-8 md:p-12 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="press-media" className="font-display font-bold text-xl md:text-2xl uppercase text-white mb-2">{t('press.mediaTitle')}</h2>
            <p className="text-rs-muted">{t('press.mediaText')}</p>
          </div>
          <Link href={`${localePath(lang, '/contact')}?type=media`} data-track="press-mediakit" className="btn-primary shrink-0">
            {t('ads.cta')}
          </Link>
        </section>
      </div>
    </div>
  )
}
