import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/i18n/seo'
import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return staticPageMetadata(lang, '/imprint', 'imprint', '/og-home.jpg')
}

export default async function ImprintPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
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
              {t('imprint.phone')}: +49 (0)163 686 7887<br />
              {t('imprint.email')}:{' '}
              <a href="mailto:contact@racespot.tv" className="text-rs-yellow hover:underline">
                contact@racespot.tv
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{t('imprint.registration')}</h2>
            <p>
              {t('imprint.court')}: Amtsgericht Köln<br />
              {t('imprint.regNumber')}: HRB 118561<br />
              {/* Required by § 5 (1) no. 6 DDG once the company has one.
                  Checksum verified 2026-09-14; VIES could not confirm it that
                  day because the German member-state service was down
                  (MS_UNAVAILABLE), which says nothing about the number. */}
              {t('imprint.vatId')}: DE367742438
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
            {/* The EU's ODR platform was shut down on 20 July 2025; linking it
                would be a dead link and a false statement. What remains is the
                declaration required by § 36 VSBG. */}
            <p>{t('imprint.notWilling')}</p>
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
