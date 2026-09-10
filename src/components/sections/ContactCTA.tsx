import Link from 'next/link'
import { getT, localePath, type Lang } from '@/lib/i18n'

export function ContactCTA({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <div className="py-20 text-center border-t border-b border-rs-border bg-rs-black">
      <div className="container-rs">
        <h2 className="font-display font-black uppercase text-white mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
          {t('cta.title')}
        </h2>
        <p className="text-[16px] text-white/60 max-w-[560px] mx-auto mb-8">
          {t('cta.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={localePath(lang, '/contact')} className="btn-primary">{t('cta.requestQuote')}</Link>
          <Link href={localePath(lang, '/broadcasts')} className="btn-outline">{t('cta.viewWork')}</Link>
        </div>
      </div>
    </div>
  )
}
