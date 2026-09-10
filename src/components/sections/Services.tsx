import Image from 'next/image'
import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

const SERVICES: { number: string; titleKey: TranslationKey; taglineKey: TranslationKey; image: string }[] = [
  {
    number: '01',
    titleKey: 'services.broadcast.title',
    taglineKey: 'services.broadcast.tagline',
    image: '/images/setup/WhatsApp Image 2026-03-13 at 09.43.42.jpeg',
  },
  {
    number: '02',
    titleKey: 'services.events.title',
    taglineKey: 'services.events.tagline',
    image: '/images/events-banner.jpg',
  },
  {
    number: '03',
    titleKey: 'services.studio.title',
    taglineKey: 'services.studio.tagline',
    image: '/images/studio-banner.jpg',
  },
  {
    number: '04',
    titleKey: 'services.hardware.title',
    taglineKey: 'services.hardware.tagline',
    image: '/images/hardware-banner.jpg',
  },
]

export function Services({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="section section--alt">
      <div className="container-rs">
        <div className="section-header">
          <div>
            <p className="section-label mb-2">{t('services.label')}</p>
            <h2 className="section-title">{t('services.title')}</h2>
          </div>
          <Link href={localePath(lang, '/services')} className="btn-ghost hidden sm:flex">
            {t('services.viewAll')}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {SERVICES.map((s) => (
            <Link
              key={s.number}
              href={localePath(lang, '/services')}
              className="group relative aspect-[16/9] rounded-rs overflow-hidden border border-rs-border hover:border-rs-yellow/50 transition-colors"
            >
              <Image
                src={s.image}
                alt={t(s.titleKey)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="text-rs-yellow/40 font-mono text-xs">{s.number}</span>
                <h3 className="font-display font-bold text-xl md:text-2xl uppercase text-white group-hover:text-rs-yellow transition-colors">
                  {t(s.titleKey)}
                </h3>
                <p className="text-white/60 text-sm mt-1">{t(s.taglineKey)}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link href={localePath(lang, '/services')} className="btn-ghost">
            {t('services.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
