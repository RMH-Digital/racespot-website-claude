import Image from 'next/image'
import { SOCIAL } from '@/lib/socials'
import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

const FOOTER_LINKS: { categoryKey: TranslationKey; links: { href: string; labelKey: TranslationKey }[] }[] = [
  {
    categoryKey: 'footer.broadcasts',
    links: [
      { href: '/broadcasts', labelKey: 'nav.broadcasts' },
      { href: '/live',       labelKey: 'nav.live' },
      { href: '/calendar',   labelKey: 'nav.calendar' },
    ],
  },
  {
    categoryKey: 'footer.company',
    links: [
      { href: '/services',   labelKey: 'nav.services' },
      { href: '/events',     labelKey: 'nav.events' },
      { href: '/news',       labelKey: 'nav.news' },
      { href: '/about',      labelKey: 'footer.aboutUs' },
      { href: '/contact',    labelKey: 'footer.contact' },
    ],
  },
]

export function Footer({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const href = (path: string) => localePath(lang, path)

  return (
    <footer className="section--alt">
      <div className="container-rs py-16">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href={href('/')} className="inline-block py-2 mb-2" prefetch={false}>
              <Image
                src="/images/logos/racespot-white.png"
                alt="Racespot"
                width={160}
                height={15}
                className="h-[15px] w-auto"
              />
            </Link>
            <p className="text-[14px] text-rs-muted leading-relaxed max-w-[260px] mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {SOCIAL.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-11 h-11 rounded-rs border border-rs-border
                             flex items-center justify-center
                             text-rs-muted text-sm
                             hover:border-rs-yellow hover:text-rs-yellow
                             transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(({ categoryKey, links }) => (
            <nav key={categoryKey} aria-labelledby={`footer-${categoryKey}`}>
              <h2
                id={`footer-${categoryKey}`}
                className="font-display font-bold text-xs uppercase tracking-widest text-white mb-3"
              >
                {t(categoryKey)}
              </h2>
              <ul className="space-y-1">
                {links.map(({ href: path, labelKey }) => (
                  <li key={path}>
                    {/* prefetch={false}: the header already prefetches every one
                        of these routes, and each prefetch is a full server
                        render because the pages are dynamic. */}
                    <Link
                      href={href(path)}
                      prefetch={false}
                      className="inline-block py-1.5 text-[13px] text-rs-muted hover:text-white transition-colors"
                    >
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-rs-border mt-8 pt-8 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-[13px] text-rs-muted">
            © {new Date().getFullYear()} Racespot Media House GmbH · {t('footer.location')}
          </p>
          <p className="text-[13px] text-rs-muted flex gap-4">
            <Link href={href('/privacy')} prefetch={false} className="py-1 hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link>
            <span aria-hidden="true">·</span>
            <Link href={href('/terms')} prefetch={false} className="py-1 hover:text-white transition-colors">{t('footer.terms')}</Link>
            <span aria-hidden="true">·</span>
            <Link href={href('/imprint')} prefetch={false} className="py-1 hover:text-white transition-colors">{t('footer.imprint')}</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
