import Image from 'next/image'
import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

const TEAM: { name: string; roleKey: TranslationKey; bioKey: TranslationKey; image: string; imagePos?: string }[] = [
  {
    name: 'Hugo L. C. Marins',
    roleKey: 'team.hugo.role',
    bioKey: 'team.hugo.bio',
    image: '/images/team/Coanda_LMVS_IRL_LM24-134.jpg',
  },
  {
    name: 'Philip Stamm',
    roleKey: 'team.philip.role',
    bioKey: 'team.philip.bio',
    image: '/images/team/IMG_2445.jpeg',
    imagePos: 'object-[center_20%]',
  },
  {
    name: 'Aaron von Lüpke',
    roleKey: 'team.aaron.role',
    bioKey: 'team.aaron.bio',
    image: '/images/team/Aaron_1[3477].jpeg',
  },
]

export function Team({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="section section--alt">
      <div className="container-rs">
        <p className="section-label mb-2">{t('team.label')}</p>
        <h2 className="section-title mb-12">{t('team.title')}</h2>

        <div className="card-grid card-grid--3">
          {TEAM.map((person) => (
            <div key={person.name} className="text-center group">
              {/* Photo Avatar */}
              <div className="w-[140px] h-[140px] mx-auto mb-5 rounded-full overflow-hidden border-[3px] border-rs-border
                              group-hover:border-rs-yellow group-hover:shadow-[0_0_20px_rgba(245,192,0,0.15)]
                              transition-all duration-300 relative">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className={`object-cover transition-transform duration-500 group-hover:scale-110 ${person.imagePos || ''}`}
                  sizes="140px"
                />
              </div>

              <h3 className="font-display font-bold text-[18px] uppercase text-white">
                {person.name}
              </h3>
              <p className="text-[13px] text-rs-yellow mt-1 mb-3">
                {t(person.roleKey)}
              </p>
              <p className="text-[13px] text-rs-muted leading-relaxed max-w-[280px] mx-auto">
                {t(person.bioKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
