import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { T } from '@/components/ui/T'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Broadcast production, live events, and studio shows — professional simracing coverage from Cologne.',
  openGraph: {
    title: 'Services | Racespot.tv',
    description: 'Broadcast production, live events, studio shows and hardware support for simracing.',
    images: [{ url: '/og-services.jpg', width: 1200, height: 630, alt: 'Racespot broadcast services' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-services.jpg'] },
}

const SERVICES = [
  {
    number: '01',
    title: 'Broadcast Production',
    tagline: 'Online & TV — at scale.',
    image: '/images/setup/WhatsApp Image 2026-03-13 at 09.43.42.jpeg',
    description:
      'We produce over 200 broadcast events per year across all major sim racing titles. From single-race streams to full-season championship coverage, our team delivers broadcast-grade quality for online platforms and TV networks.',
    details: [
      'Multi-language live commentary (DE, EN, FI, DA, NO, PT, ES, KO)',
      'Custom graphics packages and overlays',
      'TV network distribution (Eurosport, Sport 1, MotorsTV)',
      'Post-production and highlight packages',
      'YouTube channel management',
      '2.5M+ YouTube views track record',
    ],
  },
  {
    number: '02',
    title: 'Live Events',
    tagline: 'We handle the complexity.',
    image: '/images/events-banner.jpg',
    description:
      'Organizing live sim racing events requires precise logistics. We manage the full setup — from hardware procurement and transport to on-site AV infrastructure and broadcast operations.',
    details: [
      'Full event logistics and management',
      'Racing hardware setup (rigs, screens, peripherals)',
      'Audio/video broadcast infrastructure',
      'On-site technical crew',
      'Live audience productions up to 1,500 attendees',
      'Reference: RACE WEEK 2026 (July, Cologne)',
    ],
  },
  {
    number: '03',
    title: 'Studio Shows',
    tagline: 'Our studio, your production.',
    image: '/images/studio-banner.jpg',
    description:
      'Our modular studio in Cologne is the perfect backdrop for any production. Panel shows, product reveals, corporate content, or training videos — we configure the space to your needs.',
    details: [
      'Modular studio setup in Cologne',
      'Green screen and virtual sets available',
      'Full AV crew and director on request',
      'Lighting and sound design',
      'Livestream output or recorded production',
      'Flexible day/week rental',
    ],
  },
  {
    number: '04',
    title: 'Hardware & Event Support',
    tagline: 'Technical backbone for any event.',
    image: '/images/hardware-banner.jpg',
    description:
      'Need gear on-site without the production complexity? We supply, transport, and configure professional sim racing hardware for your event — and stay on-site to make sure it runs flawlessly.',
    details: [
      'Sim racing rig fleet (various configurations)',
      'Screens, stands, and cable management',
      'On-site technical support',
      'Event-day troubleshooting',
      'Available for exhibitions, brand activations, trade shows',
    ],
  },
]

const SETUP_PHOTOS = [
  '/images/setup/image (5).jpeg',
  '/images/setup/image (4).jpeg',
  '/images/setup/Image.jpeg',
  '/images/setup/Image (1).jpeg',
  '/images/setup/image (6).jpeg',
  '/images/setup/SimplyRace-8654.jpeg',
  '/images/setup/WhatsApp Image 2026-03-13 at 09.41.36.jpeg',
  '/images/setup/WhatsApp Image 2026-03-13 at 09.42.54.jpeg',
  '/images/setup/ERLFinals-Heat1-38.jpeg',
]

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src="/images/setup/broadcast-control-room.jpg"
          alt="Racespot broadcast production team"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3"><T k="servicesPage.label" /></p>
            <h1 className="display-title"><T k="servicesPage.title" /></h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-16">
        <p className="text-rs-muted max-w-xl mb-16">
          <T k="servicesPage.intro" />
        </p>

        <div className="space-y-px">
          {SERVICES.map((s) => (
            <details
              key={s.number}
              className="group border border-rs-border bg-rs-black open:bg-rs-dark transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 p-8 cursor-pointer list-none">
                <div className="flex items-center gap-6">
                  <span className="text-rs-border font-mono text-sm group-open:text-rs-yellow/50 transition-colors">
                    {s.number}
                  </span>
                  <div>
                    <h2 className="text-rs-white font-semibold text-xl group-open:text-rs-yellow transition-colors">
                      {s.title}
                    </h2>
                    <p className="text-rs-muted text-sm mt-0.5">{s.tagline}</p>
                  </div>
                </div>
                <span className="text-rs-muted text-2xl font-light group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>

              <div className="px-8 pb-8">
                <div className="border-t border-rs-border pt-8">
                  {/* Service image */}
                  <div className="relative w-full h-[200px] md:h-[280px] rounded-rs overflow-hidden mb-8">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className={`object-cover ${s.image.includes('studio') ? 'object-top' : ''}`}
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rs-black/50 to-transparent" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <p className="text-rs-muted leading-relaxed">{s.description}</p>
                    <ul className="space-y-2.5">
                      {s.details.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-rs-muted">
                          <span className="w-1 h-1 rounded-full bg-rs-yellow mt-2 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* Behind the Scenes - How We Work Photos */}
        <div className="mt-20">
          <p className="section-label mb-3"><T k="servicesPage.behindScenes" /></p>
          <h2 className="font-display font-bold text-2xl uppercase text-white mb-8"><T k="servicesPage.ourSetup" /></h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {SETUP_PHOTOS.map((src, i) => {
              // First two images span full width on mobile, larger on desktop
              const isFeature = i < 2
              return (
                <div
                  key={i}
                  className={`relative rounded-rs overflow-hidden group ${
                    isFeature
                      ? 'col-span-2 md:col-span-1 aspect-[16/10]'
                      : 'aspect-[4/3]'
                  } ${i === 2 ? 'md:row-span-2 md:aspect-auto md:h-full' : ''}`}
                >
                  <Image
                    src={src}
                    alt={`Racespot broadcast setup ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={isFeature ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 50vw, 33vw'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rs-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-rs-muted mb-6"><T k="servicesPage.readyToTalk" /></p>
          <Link href="/contact" className="btn-primary">
            <T k="servicesPage.getInTouch" />
          </Link>
        </div>
      </div>
    </div>
  )
}
