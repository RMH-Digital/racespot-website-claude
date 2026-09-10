'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LANGUAGES, getT, localePath, switchLangPath, type Lang } from '@/lib/i18n'
import { useLiveStatus } from '@/components/layout/LiveStatusProvider'
import type { TranslationKey } from '@/lib/i18n/translations'

const NAV_LINKS: { href: string; labelKey: TranslationKey; isLiveLink?: boolean }[] = [
  { href: '/broadcasts', labelKey: 'nav.broadcasts' },
  { href: '/calendar',   labelKey: 'nav.calendar' },
  { href: '/events',     labelKey: 'nav.events' },
  { href: '/services',   labelKey: 'nav.services' },
  { href: '/news',       labelKey: 'nav.news' },
  { href: '/live',       labelKey: 'nav.live', isLiveLink: true },
]

export function Header({ lang }: { lang: Lang }) {
  const { liveCount, isLive } = useLiveStatus()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const t = getT(lang)

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  useEffect(() => {
    setMenuOpen(false)
    setLangOpen(false)
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = (href: string) => pathname.startsWith(localePath(lang, href))

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-rs-black/[0.97] backdrop-blur-[10px] border-b border-rs-border">
      <div className="container-rs flex items-center justify-between h-full">
        {/* Logo */}
        <Link href={localePath(lang, '/')} className="flex items-center shrink-0">
          <Image
            src="/images/logos/racespot-white.png"
            alt="Racespot"
            width={160}
            height={15}
            className="h-[15px] w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, labelKey, isLiveLink }) => {
            const active = isActive(href)
            const showLiveIndicator = isLiveLink && isLive

            return (
              <Link
                key={href}
                href={localePath(lang, href)}
                className={`relative flex items-center gap-1.5 px-3 py-2
                  font-display font-semibold text-[13px] tracking-[0.08em] uppercase
                  transition-colors duration-200
                  ${showLiveIndicator ? 'text-rs-live' : active ? 'text-white' : 'text-rs-muted hover:text-white'}
                `}
              >
                {showLiveIndicator && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rs-live opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rs-live" />
                  </span>
                )}
                {t(labelKey)}
                {showLiveIndicator && liveCount > 1 && (
                  <span className="ml-0.5 bg-rs-live text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {liveCount}
                  </span>
                )}
                {active && !showLiveIndicator && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-rs-yellow" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side: lang dropdown + CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-rs-border rounded-rs text-[11px] font-display font-semibold uppercase tracking-wider text-white hover:border-rs-yellow/50 transition-colors"
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.code.toUpperCase()}</span>
              <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className={`ml-0.5 transition-transform ${langOpen ? 'rotate-180' : ''}`}>
                <path d="M4 5L0 0h8L4 5z" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 bg-rs-dark border border-rs-border rounded-rs overflow-hidden shadow-xl min-w-[140px] z-50">
                {/* Real links, not buttons: the same page in another language is
                    another URL, and the middleware remembers the choice. */}
                {LANGUAGES.map((l) => (
                  <Link
                    key={l.code}
                    href={switchLangPath(pathname, l.code)}
                    hrefLang={l.code}
                    lang={l.code}
                    onClick={() => setLangOpen(false)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-display uppercase tracking-wider transition-colors
                      ${l.code === lang ? 'bg-rs-yellow/10 text-rs-yellow' : 'text-rs-muted hover:text-white hover:bg-rs-gray'}`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href={localePath(lang, '/contact')} className="btn-primary btn-sm">
            {t('nav.getQuote')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`block w-5 h-px bg-white transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-rs-dark border-t border-rs-border">
          <nav className="container-rs py-6 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, labelKey, isLiveLink }) => {
              const active = isActive(href)
              const showLiveIndicator = isLiveLink && isLive

              return (
                <Link
                  key={href}
                  href={localePath(lang, href)}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-rs
                    font-display font-semibold text-[15px] tracking-[0.06em] uppercase
                    ${showLiveIndicator ? 'text-rs-live' : active ? 'text-white bg-rs-gray' : 'text-rs-muted'}
                  `}
                >
                  {showLiveIndicator && <span className="w-2 h-2 rounded-full bg-rs-live animate-pulse-live" />}
                  {t(labelKey)}
                  {showLiveIndicator && liveCount > 1 && (
                    <span className="ml-1 bg-rs-live text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {liveCount}
                    </span>
                  )}
                </Link>
              )
            })}
            <div className="mt-4 pt-4 border-t border-rs-border space-y-3">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <Link
                    key={l.code}
                    href={switchLangPath(pathname, l.code)}
                    hrefLang={l.code}
                    lang={l.code}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-rs text-[11px] font-display font-semibold uppercase tracking-wider border transition-colors
                      ${l.code === lang
                        ? 'bg-rs-yellow text-rs-black border-rs-yellow'
                        : 'text-rs-muted border-rs-border hover:text-white'}`}
                  >
                    <span>{l.flag}</span>
                    {l.code.toUpperCase()}
                  </Link>
                ))}
              </div>
              <Link href={localePath(lang, '/contact')} className="btn-primary btn-sm block text-center">{t('nav.getQuote')}</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
