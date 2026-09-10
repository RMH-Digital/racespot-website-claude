import type { Metadata } from 'next'
import Image from 'next/image'
import { Team } from '@/components/sections/Team'
import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Racespot — the world\'s leading simracing broadcast studio, based in Cologne, Germany.',
  openGraph: {
    title: 'About Us | Racespot.tv',
    description: 'The world\'s leading simracing broadcast studio, based in Cologne, Germany. Since 2013.',
    images: [{ url: '/og-about.jpg', width: 1200, height: 630, alt: 'Racespot team' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-about.jpg'] },
}

const MILESTONES: { year: string; textKey: TranslationKey }[] = [
  { year: '2013', textKey: 'about.milestone.2013' },
  { year: '2016', textKey: 'about.milestone.2016' },
  { year: '2018', textKey: 'about.milestone.2018' },
  { year: '2019', textKey: 'about.milestone.2019' },
  { year: '2021', textKey: 'about.milestone.2021' },
  { year: '2023', textKey: 'about.milestone.2023' },
  { year: '2024', textKey: 'about.milestone.2024' },
]

const STATS: { value: string; labelKey: TranslationKey }[] = [
  { value: '400+', labelKey: 'about.stat.events' },
  { value: '8', labelKey: 'about.stat.languages' },
  { value: '100M+', labelKey: 'about.stat.impressions' },
  { value: '6.2M+', labelKey: 'about.stat.ytViews' },
]

export default function AboutPage({ params: { lang } }: { params: { lang: Lang } }) {
  const t = getT(lang)
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src="/images/gallery/SimplyRace-8482.jpg"
          alt="Racespot team at event"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3">{t('about.label')}</p>
            <h1 className="display-title">{t('about.title')}</h1>
          </div>
        </div>
      </section>

      {/* About content */}
      <div className="container-rs py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="font-display font-bold text-2xl uppercase text-white mb-6">
              {t('about.heading1')}
            </h2>
            <div className="space-y-4 text-[15px] text-rs-muted leading-relaxed">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <p>{t('about.p3')}</p>
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-2xl uppercase text-white mb-6">
              {t('about.heading2')}
            </h2>
            <div className="space-y-4 text-[15px] text-rs-muted leading-relaxed">
              <p>{t('about.p4')}</p>
              <p>{t('about.p5')}</p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {STATS.map((stat) => (
                <div key={stat.labelKey} className="bg-rs-dark border border-rs-border rounded-rs p-4">
                  <p className="font-display font-black text-rs-yellow text-2xl">{stat.value}</p>
                  <p className="text-xs text-rs-muted uppercase tracking-wider mt-1">{t(stat.labelKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <p className="section-label mb-2">{t('about.journey')}</p>
          <h2 className="font-display font-bold text-2xl uppercase text-white mb-10">{t('about.milestones')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MILESTONES.map((m) => (
              <div key={m.year} className="border-l-2 border-rs-yellow pl-4 py-2">
                <p className="font-display font-bold text-rs-yellow text-lg">{m.year}</p>
                <p className="text-sm text-rs-muted mt-1">{t(m.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team section (reused component) */}
      <Team lang={lang} />

      {/* Behind the scenes images */}
      <section className="section">
        <div className="container-rs">
          <p className="section-label mb-2">{t('about.behindScenes')}</p>
          <h2 className="font-display font-bold text-2xl uppercase text-white mb-8">{t('about.howWeWork')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: '/images/setup/image (5).jpeg', alt: 'Broadcast equipment setup' },
              { src: '/images/setup/image (4).jpeg', alt: 'Production control room' },
              { src: '/images/setup/Image.jpeg', alt: 'Sim racing hardware' },
              { src: '/images/setup/Image (1).jpeg', alt: 'Event preparation' },
              { src: '/images/setup/SimplyRace-8654.jpeg', alt: 'Behind the scenes' },
              { src: '/images/setup/WhatsApp Image 2026-03-13 at 09.41.36.jpeg', alt: 'On-site broadcast setup' },
            ].map((img) => (
              <div key={img.src} className="relative aspect-[4/3] rounded-rs overflow-hidden group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rs-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
