import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'

export function generateMetadata({ params: { lang } }: { params: { lang: Lang } }): Metadata {
  return staticPageMetadata(lang, '/imprint', 'imprint', '/og-home.jpg')
}

export default function ImprintPage({ params: { lang } }: { params: { lang: Lang } }) {
  const t = getT(lang)
  return (
    <div className="pt-8">
      <div className="container-rs py-8 max-w-3xl">
        <p className="section-label mb-3">{t('imprint.label')}</p>
        <h1 className="display-title mb-10">{t('imprint.title')}</h1>

        <div className="space-y-8 text-rs-muted leading-relaxed">
          {/* Company Info */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{t('imprint.companyInfo')}</h2>
            <p>
              Racespot Media House GmbH<br />
              An der Hasenkaule 10 (21D)<br />
              50354 Hürth<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{t('imprint.managingDirector')}</h2>
            <p>Philip Stamm</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{t('imprint.contact')}</h2>
            <p>
              Phone: +49 (0)163 686 7887<br />
              Email:{' '}
              <a href="mailto:contact@racespot.tv" className="text-rs-yellow hover:underline">
                contact@racespot.tv
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{t('imprint.registration')}</h2>
            <p>
              {t('imprint.court')}: Amtsgericht Köln<br />
              {t('imprint.regNumber')}: HRB 118561
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{t('imprint.responsible')}</h2>
            <p>
              Racespot Media House GmbH<br />
              An der Hasenkaule 10 (21D)<br />
              50354 Hürth
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{t('imprint.dispute')}</h2>
            <p>
              {t('imprint.odr')}{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rs-yellow hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-3">
              {t('imprint.notWilling')}
            </p>
          </section>

          {/* Links to other legal pages */}
          <div className="border-t border-rs-border pt-8 flex flex-wrap gap-6">
            <Link href={localePath(lang, '/privacy')} className="text-rs-yellow hover:underline text-sm">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href={localePath(lang, '/terms')} className="text-rs-yellow hover:underline text-sm">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
