import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import Image from 'next/image'
import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return staticPageMetadata(lang, '/services', 'services', '/og-services.jpg')
}

type ServiceKey = 'broadcast' | 'events' | 'studio' | 'hardware'

const SERVICES: { number: string; key: ServiceKey; image: string; details: number }[] = [
  { number: '01', key: 'broadcast', image: '/images/setup/WhatsApp Image 2026-03-13 at 09.43.42.jpeg', details: 6 },
  { number: '02', key: 'events',    image: '/images/events-banner.jpg',   details: 6 },
  { number: '03', key: 'studio',    image: '/images/studio-banner.jpg',   details: 6 },
  { number: '04', key: 'hardware',  image: '/images/hardware-banner.jpg', details: 5 },
]

/** The texts of one service — title/tagline from the home teaser, the rest from servicesPage.* */
function serviceText(t: (k: TranslationKey) => string, key: ServiceKey, details: number) {
  return {
    title: t(`services.${key}.title`),
    tagline: t(`services.${key}.tagline`),
    description: t(`servicesPage.${key}.desc`),
    details: Array.from({ length: details }, (_, i) => t(`servicesPage.${key}.d${i + 1}` as TranslationKey)),
  }
}

const SETUP_PHOTOS = [
  '/images/setup/image (5).jpeg',
  '/images/setup/image (4).jpeg',
  '/images/setup/Image.jpeg',
  '/images/setup/Image (1).jpeg',
  '/images/setup/image (6).jpeg',
  '/images/setup/SimplyRace-8654.jpeg',
  '/images/setup/WhatsApp Image 2026-03-13 at 09.41.36.jpeg',
  '/images/setup/WhatsApp Image 2026-03-13 at 09.42.54.jpeg',
  '/images/setup/ERLFinals-Heat1-38.jpeg',
]

export default function ServicesPage({ params: { lang } }: { params: { lang: Lang } }) {
  const t = getT(lang)
  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src="/images/setup/broadcast-control-room.jpg"
          alt={t('servicesPage.heroAlt')}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3">{t('servicesPage.label')}</p>
            <h1 className="display-title">{t('servicesPage.title')}</h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-16">
        <p className="text-rs-muted max-w-xl mb-16">
          {t('servicesPage.intro')}
        </p>

        <div className="space-y-px">
          {SERVICES.map((svc) => {
            const s = { ...svc, ...serviceText(t, svc.key, svc.details) }
            return (
              <details
                key={s.number}
                className="group border border-rs-border bg-rs-black open:bg-rs-dark transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 p-8 cursor-pointer list-none">
                  <div className="flex items-center gap-6">
                    <span className="text-rs-border font-mono text-sm group-open:text-rs-yellow/50 transition-colors">
                      {s.number}
                    </span>
                    <div>
                      <h2 className="text-rs-white font-semibold text-xl group-open:text-rs-yellow transition-colors">
                        {s.title}
                      </h2>
                      <p className="text-rs-muted text-sm mt-0.5">{s.tagline}</p>
                    </div>
                  </div>
                  <span className="text-rs-muted text-2xl font-light group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>

                <div className="px-8 pb-8">
                  <div className="border-t border-rs-border pt-8">
                    {/* Service image */}
                    <div className="relative w-full h-[200px] md:h-[280px] rounded-rs overflow-hidden mb-8">
                      <Image
                        src={s.image}
                        alt={s.title}
                        fill
                        className={`object-cover ${s.image.includes('studio') ? 'object-top' : ''}`}
                        sizes="(max-width: 768px) 100vw, 1200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-rs-black/50 to-transparent" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <p className="text-rs-muted leading-relaxed">{s.description}</p>
                      <ul className="space-y-2.5">
                        {s.details.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-sm text-rs-muted">
                            <span className="w-1 h-1 rounded-full bg-rs-yellow mt-2 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </details>
            )
          })}
        </div>

        {/* Behind the Scenes - How We Work Photos */}
        <div className="mt-20">
          <p className="section-label mb-3">{t('servicesPage.behindScenes')}</p>
          <h2 className="font-display font-bold text-2xl uppercase text-white mb-8">{t('servicesPage.ourSetup')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {SETUP_PHOTOS.map((src, i) => {
              // First two images span full width on mobile, larger on desktop
              const isFeature = i < 2
              return (
                <div
                  key={i}
                  className={`relative rounded-rs overflow-hidden group ${
                    isFeature
                      ? 'col-span-2 md:col-span-1 aspect-[16/10]'
                      : 'aspect-[4/3]'
                  } ${i === 2 ? 'md:row-span-2 md:aspect-auto md:h-full' : ''}`}
                >
                  <Image
                    src={src}
                    alt={`${t('servicesPage.setupPhotoAlt')} ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={isFeature ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 50vw, 33vw'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rs-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-rs-muted mb-6">{t('servicesPage.readyToTalk')}</p>
          <Link href={localePath(lang, '/contact')} className="btn-primary">
            {t('servicesPage.getInTouch')}
          </Link>
        </div>
      </div>
    </div>
  )
}
