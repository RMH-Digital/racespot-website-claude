import Image from 'next/image'
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

const SOCIAL = [
  {
    href: 'https://www.youtube.com/@RaceSpotTV',
    label: 'YouTube',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M14.2 3.8a1.8 1.8 0 0 0-1.3-1.3C11.8 2.2 8 2.2 8 2.2s-3.8 0-4.9.3A1.8 1.8 0 0 0 1.8 3.8C1.5 4.9 1.5 8 1.5 8s0 3.1.3 4.2a1.8 1.8 0 0 0 1.3 1.3c1.1.3 4.9.3 4.9.3s3.8 0 4.9-.3a1.8 1.8 0 0 0 1.3-1.3c.3-1.1.3-4.2.3-4.2s0-3.1-.3-4.2ZM6.5 10.5v-5L10.7 8 6.5 10.5Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.twitch.tv/racespottv',
    label: 'Twitch',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M3.5 1 2 4.5V13h3.5v2H8l2-2h2.5L16 9.5V1H3.5ZM14.5 9l-2 2H9.5L8 12.5V11H4.5V2.5h10V9Z" />
        <path d="M10.5 4.5h1.5v4h-1.5zM7 4.5h1.5v4H7z" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/racespottv',
    label: 'Instagram',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1.4c2.2 0 2.4 0 3.3.1.8 0 1.2.2 1.5.3.4.1.7.3 1 .6.3.3.5.6.6 1 .1.3.2.7.3 1.5 0 .9.1 1.1.1 3.3s0 2.4-.1 3.3c0 .8-.2 1.2-.3 1.5-.1.4-.3.7-.6 1-.3.3-.6.5-1 .6-.3.1-.7.2-1.5.3-.9 0-1.1.1-3.3.1s-2.4 0-3.3-.1c-.8 0-1.2-.2-1.5-.3-.4-.1-.7-.3-1-.6-.3-.3-.5-.6-.6-1-.1-.3-.2-.7-.3-1.5 0-.9-.1-1.1-.1-3.3s0-2.4.1-3.3c0-.8.2-1.2.3-1.5.1-.4.3-.7.6-1 .3-.3.6-.5 1-.6.3-.1.7-.2 1.5-.3.9 0 1.1-.1 3.3-.1ZM8 0C5.7 0 5.5 0 4.6.1c-.9 0-1.5.2-2 .4-.6.2-1 .5-1.5 1-.5.5-.8.9-1 1.5-.2.5-.3 1.1-.4 2C-.1 5.5 0 5.7 0 8s0 2.5.1 3.4c0 .9.2 1.5.4 2 .2.6.5 1 1 1.5.5.5.9.8 1.5 1 .5.2 1.1.3 2 .4.9 0 1.1.1 3.4.1s2.5 0 3.4-.1c.9 0 1.5-.2 2-.4.6-.2 1-.5 1.5-1s.8-.9 1-1.5c.2-.5.3-1.1.4-2 0-.9.1-1.1.1-3.4s0-2.5-.1-3.4c0-.9-.2-1.5-.4-2-.2-.6-.5-1-1-1.5s-.9-.8-1.5-1c-.5-.2-1.1-.3-2-.4C10.5 0 10.3 0 8 0Z" />
        <path d="M8 3.9a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2Zm0 6.8a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4ZM12.4 3.7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.tiktok.com/@racespot_tv',
    label: 'TikTok',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M11.8 0h-2.5v10.9c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3 1-2.3 2.3-2.3c.3 0 .5 0 .7.1V6.1c-.2 0-.5-.1-.7-.1C4.1 6 1.8 8.3 1.8 11.2S4.1 16 7 16s5.2-2.3 5.2-5.2V5.2A6.5 6.5 0 0 0 16 6.5V4a4.7 4.7 0 0 1-4.2-4Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.facebook.com/RaceSpotTV',
    label: 'Facebook',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M16 8a8 8 0 1 0-9.3 7.9v-5.6H4.7V8h2V6.2c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.3V8h2.2l-.4 2.3H9.2v5.6A8 8 0 0 0 16 8Z" />
      </svg>
    ),
  },
  {
    href: 'https://x.com/racespottv',
    label: 'X',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M9.3 6.8 14.8 0h-1.3L8.7 5.9 4.7 0H.3l5.8 8.4L.3 16h1.3l5-5.9L10.9 16h4.4L9.3 6.8Zm-1.8 2.1-.6-.8L2.2 1h2l3.7 5.3.6.8 4.7 6.8h-2L7.5 8.9Z" />
      </svg>
    ),
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
            <Link href={href('/')} className="inline-block mb-4">
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
            <div className="flex gap-4">
              {SOCIAL.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-rs border border-rs-border
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
            <div key={categoryKey}>
              <h4 className="font-display font-bold text-xs uppercase tracking-[0.1em] text-white mb-4">
                {t(categoryKey)}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ href: path, labelKey }) => (
                  <li key={path}>
                    <Link
                      href={href(path)}
                      className="text-[13px] text-rs-muted hover:text-white transition-colors"
                    >
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-rs-border mt-8 pt-8 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-[13px] text-rs-muted">
            © {new Date().getFullYear()} Racespot Media House GmbH · Hürth, Germany
          </p>
          <p className="text-[13px] text-rs-muted flex gap-4">
            <Link href={href('/privacy')} className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link>
            <span>·</span>
            <Link href={href('/terms')} className="hover:text-white transition-colors">{t('footer.terms')}</Link>
            <span>·</span>
            <Link href={href('/imprint')} className="hover:text-white transition-colors">{t('footer.imprint')}</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
