import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

/**
 * "From first call to first lap" — the client-facing breather, placed between
 * the Services grid and the news section.
 *
 * Deliberately text over tiles: big step numbers, a headline and a paragraph
 * each. Anyone weighing up whether to have a season produced wants to know
 * what the process looks like, and that question was answered nowhere on the
 * home page.
 *
 * Copy lives in translations.ts under `home.process.*` and is a draft.
 */
const STEPS: { title: TranslationKey; desc: TranslationKey }[] = [
  { title: 'home.process.step1.title', desc: 'home.process.step1.desc' },
  { title: 'home.process.step2.title', desc: 'home.process.step2.desc' },
  { title: 'home.process.step3.title', desc: 'home.process.step3.desc' },
]

export function Process({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="section">
      <div className="container-rs">
        <div className="max-w-[720px] mb-12">
          <p className="section-label mb-2">{t('home.process.label')}</p>
          <h2 className="section-title">{t('home.process.title')}</h2>
        </div>

        <ol className="grid md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative md:pt-7">
              {/* Hairline above each step on desktop, so the row reads as a
                  sequence without needing arrows. */}
              <span className="hidden md:block absolute top-0 left-0 right-0 h-px bg-rs-border" aria-hidden="true" />
              <span
                className="block font-display font-black text-rs-yellow/25 leading-none text-[44px] md:text-[54px] mb-3 md:mb-4"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display font-bold uppercase tracking-[0.06em] text-white text-[16px] mb-3">
                {t(step.title)}
              </h3>
              <p className="text-[14px] text-rs-muted leading-relaxed">{t(step.desc)}</p>
            </li>
          ))}
        </ol>

        <Link href={localePath(lang, '/contact')} data-track="cta-quote-process" className="btn-primary mt-12">
          {t('home.process.cta')}
        </Link>
      </div>
    </section>
  )
}
