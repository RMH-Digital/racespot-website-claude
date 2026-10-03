import { getT, type Lang } from '@/lib/i18n'

const LOGOS = [
  { src: '/images/partners/Porsche.png', w: 600, h: 300, alt: 'Porsche' },
  { src: '/images/partners/BMW.png', w: 600, h: 300, alt: 'BMW' },
  { src: '/images/partners/AudiSport.png', w: 600, h: 300, alt: 'Audi Sport' },
  { src: '/images/partners/Mazda.png', w: 600, h: 300, alt: 'Mazda' },
  { src: '/images/partners/VCO.png', w: 600, h: 300, alt: 'VCO' },
  { src: '/images/partners/iRacing-COL.png', w: 600, h: 300, alt: 'iRacing' },
  { src: '/images/partners/Verizon.png', w: 600, h: 300, alt: 'Verizon' },
  { src: '/images/partners/ENASCAR-COL.png', w: 600, h: 300, alt: 'eNASCAR' },
  { src: '/images/partners/bmwgt.png', w: 300, h: 225, alt: 'BMW GT' },
  { src: '/images/partners/pesc-1.png', w: 300, h: 225, alt: 'PESC' },
  { src: '/images/partners/creve.png', w: 300, h: 225, alt: 'Creve' },
  { src: '/images/partners/dnls.png', w: 300, h: 225, alt: 'DNLS' },
  { src: '/images/partners/indy.png', w: 300, h: 225, alt: 'Indy' },
]

/* Split logos into two rows for opposite-direction scrolling */
const ROW_1 = LOGOS.slice(0, 7)
const ROW_2 = LOGOS.slice(7)

function LogoRow({
  logos,
  direction,
}: {
  logos: typeof LOGOS
  direction: 'left' | 'right'
}) {
  /* Duplicate logos 4x so the strip is wide enough for a seamless loop */
  const items = [...logos, ...logos, ...logos, ...logos]

  return (
    <div className="pause-on-hover relative overflow-hidden">
      {/* Fade masks on left/right edges — yellow to match background */}
      <div className="marquee-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-rs-yellow to-transparent" />
      <div className="marquee-fade pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-rs-yellow to-transparent" />

      <div
        className={`flex items-center gap-16 w-max ${
          direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'
        }`}
      >
        {items.map((logo, i) => (
          <div
            key={`${logo.alt}-${i}`}
            // Copies two to four exist only for the seamless loop; when the
            // strip may not move they are hidden and the first set wraps.
            data-copy={i >= logos.length ? '' : undefined}
            className="shrink-0 flex items-center justify-center px-4"
          >
            {/* Use native img instead of next/image — lazy loading breaks
                in CSS-animated carousels because the browser can't detect
                viewport intersection on continuously moving elements.
                The PNGs are 10–60 KB each, so there is nothing to optimise. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              // The real size, so the strip is as wide before the logos
              // arrive as after: it used to grow while they loaded and the
              // loop point jumped.
              width={logo.w}
              height={logo.h}
              loading="eager"
              decoding="async"
              className="h-[50px] w-auto object-contain
                         opacity-80 hover:opacity-100
                         hover:scale-110
                         transition-[opacity,scale] duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PartnerLogos({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="py-16 bg-rs-yellow">
      <div className="container-rs">
        <p className="text-rs-black/60 text-xs tracking-[0.2em] uppercase font-mono mb-2 text-center">
          {t('partners.trustedBy')}
        </p>
        <h2 className="font-display font-black text-2xl md:text-3xl uppercase text-rs-black tracking-tight mb-10 text-center">
          {t('partners.title')}
        </h2>
      </div>

      <div className="flex flex-col gap-8">
        <LogoRow logos={ROW_1} direction="left" />
        <LogoRow logos={ROW_2} direction="right" />
      </div>
    </section>
  )
}
