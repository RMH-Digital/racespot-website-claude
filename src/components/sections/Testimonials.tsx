import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { MIN_SHOWN, getVoices } from '@/lib/testimonials'
import { VoicesCarousel } from './VoicesCarousel'

const ROLE_KEY: Record<string, TranslationKey> = {
  viewer: 'home.voices.role.viewer',
  organiser: 'home.voices.role.organiser',
  partner: 'home.voices.role.partner',
  driver: 'home.voices.role.driver',
}

/**
 * Voices of the people we broadcast for and to — chosen from the reviews
 * archive in Racespot Analytics, rules and selection in lib/testimonials.ts.
 * Full width, one quote at a time (VoicesCarousel). No platform logo, no
 * star widget: a quote, a name, and who they are to us.
 */
export async function Testimonials({ lang }: { lang: Lang }) {
  const voices = await getVoices()
  if (voices.length < MIN_SHOWN) return null
  const t = getT(lang)

  return (
    <section className="section--alt py-20 md:py-28 border-y border-rs-border" aria-labelledby="voices-title">
      <div className="container-rs-wide">
        <div className="mb-12 text-center md:mb-16">
          <p className="section-label mb-2">{t('home.voices.label')}</p>
          <h2 id="voices-title" className="section-title">{t('home.voices.title')}</h2>
        </div>

        <VoicesCarousel
          voices={voices.map((v) => ({ id: v.id, quote: v.quote, name: v.name, lang: v.lang, role: v.role ? t(ROLE_KEY[v.role]) : undefined }))}
          labels={{
            prev: t('home.voices.prev'),
            next: t('home.voices.next'),
            goTo: t('home.voices.goTo'),
            carousel: t('home.voices.title'),
          }}
        />

        <p className="mt-8 text-center text-xs text-rs-muted">{t('home.voices.note')}</p>
      </div>
    </section>
  )
}
