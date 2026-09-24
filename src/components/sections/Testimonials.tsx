import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'
import { MIN_SHOWN, getVoices } from '@/lib/testimonials'

const ROLE_KEY: Record<string, TranslationKey> = {
  viewer: 'home.voices.role.viewer',
  organiser: 'home.voices.role.organiser',
  partner: 'home.voices.role.partner',
  driver: 'home.voices.role.driver',
}

/**
 * Voices of the people we broadcast for and to — chosen from the reviews
 * archive in Racespot Analytics, rules and selection in lib/testimonials.ts.
 * No platform logo, no star widget: a quote, a
 * name, and who they are to us.
 */
export async function Testimonials({ lang }: { lang: Lang }) {
  const shown = await getVoices()
  if (shown.length < MIN_SHOWN) return null
  const t = getT(lang)

  return (
    <section className="section" aria-labelledby="voices-title">
      <div className="container-rs">
        <div className="section-header">
          <div>
            <p className="section-label mb-2">{t('home.voices.label')}</p>
            <h2 id="voices-title" className="section-title">{t('home.voices.title')}</h2>
          </div>
        </div>

        <div className="card-grid card-grid--3">
          {shown.map((v) => (
            <figure key={v.id} className="flex flex-col rounded-rs border border-rs-border bg-rs-dark p-6 md:p-7">
              <svg width="28" height="22" viewBox="0 0 28 22" fill="currentColor" aria-hidden="true" className="mb-4 text-rs-yellow">
                <path d="M0 22V13.2C0 5.9 4.1 1.4 11.2 0l1.3 3.1C8.4 4.6 6.5 7.3 6.4 10.6H12V22H0Zm16 0V13.2C16 5.9 20.1 1.4 27.2 0l1.3 3.1c-4.1 1.5-6 4.2-6.1 7.5H28V22H16Z" />
              </svg>
              <blockquote lang={v.lang} className="flex-1 text-[15px] leading-relaxed text-white/85">
                <p>{v.quote}</p>
              </blockquote>
              <figcaption className="mt-6 border-t border-rs-border pt-4 text-sm">
                <span className="font-semibold text-white">{v.name}</span>
                {v.role && <span className="text-rs-muted"> · {t(ROLE_KEY[v.role])}</span>}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-xs text-rs-muted">{t('home.voices.note')}</p>
      </div>
    </section>
  )
}
