import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PastEventCard from '@/components/sections/PastEventCard'
import { T } from '@/components/ui/T'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past live sim racing events produced by Racespot — the leading simracing broadcast studio.',
  openGraph: {
    title: 'Events | Racespot.tv',
    description: 'Upcoming and past live sim racing events produced by Racespot.',
    images: [{ url: '/og-events.jpg', width: 1200, height: 630, alt: 'Racespot live events' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-events.jpg'] },
}

const PAST_EVENTS = [
  {
    name: 'Rennsport Re-Launch 2026',
    year: '2026',
    location: 'Germany',
    images: [
      '/images/events/rennsport-relaunch-2026/DSC00103.jpg',
      '/images/events/rennsport-relaunch-2026/DSC00329.jpg',
      '/images/events/rennsport-relaunch-2026/DSC09899.jpg',
      '/images/events/rennsport-relaunch-2026/DSC00301.jpg',
    ],
  },
  {
    name: 'Sim Racing Expo 2025',
    year: '2025',
    location: 'Dortmund, Germany',
    images: [
      '/images/events/sim-racing-expo-2025/IMG_6845.jpg',
      '/images/events/sim-racing-expo-2025/IMG_6780.jpg',
      '/images/events/sim-racing-expo-2025/IMG_6795.jpg',
      '/images/events/sim-racing-expo-2025/IMG_6869.jpg',
      '/images/events/sim-racing-expo-2025/IMG_6885.jpg',
    ],
  },
  {
    name: 'Esports World Cup 2025',
    year: '2025',
    location: 'Riyadh, Saudi Arabia',
    images: [
      '/images/gallery/flickr_54643383044.jpg',
      '/images/gallery/54643394093_6bc878753c_o.jpeg',
      '/images/gallery/54645437953_ee8e481f6d_o.jpeg',
      '/images/gallery/flickr_54643466460.jpg',
    ],
  },
  {
    name: 'Milton Keynes Summit 2022',
    year: '2022',
    location: 'Milton Keynes, UK',
    images: [
      '/images/events/milton-keynes-2022/SimplyRace-8900.jpg',
      '/images/events/milton-keynes-2022/SimplyRace-8918.jpg',
      '/images/events/milton-keynes-2022/SimplyRace-8617.jpg',
    ],
  },
  {
    name: 'BMW SIM Live Munich 2019',
    year: '2019',
    location: 'Munich, Germany',
    images: [
      '/images/events/bmw-sim-live-2019/2019-BMW-SIM-Live-Event-07.jpg',
      '/images/events/bmw-sim-live-2019/BMW-sim-live-2019-14.jpg',
      '/images/events/bmw-sim-live-2019/2019-BMW-SIM-Live-Event-03.jpg',
      '/images/events/bmw-sim-live-2019/2019-BMW-SIM-Live-Event-06.jpg',
    ],
  },
  {
    name: 'Porsche Simracing Summit 2018',
    year: '2018',
    location: 'Leipzig, Germany',
    images: [
      '/images/events/porsche-summit-2018/48357825_10156928792516085_7385535851356225536_n.jpg',
      '/images/events/porsche-summit-2018/48372144_2018785294864123_1694205474028650496_n.jpg',
      '/images/events/porsche-summit-2018/48415660_2018785104864142_1393564059730706432_n.jpg',
      '/images/events/porsche-summit-2018/48411332_2018785111530808_8077290241897005056_n.jpg',
    ],
  },
]

export default function EventsPage() {
  return (
    <div>
      {/* ── Hero Banner ── */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src="/images/setup/WhatsApp Image 2026-03-13 at 09.42.54.jpeg"
          alt="Racespot broadcast production setup"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rs-black via-rs-black/60 to-rs-black/20" />
        {/* Yellow accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />

        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3"><T k="events.label" /></p>
            <h1 className="display-title"><T k="events.title" /></h1>
          </div>
        </div>
      </section>

      <div className="container-rs py-16">
        {/* ── After Movie ── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-rs-yellow font-display font-bold text-xl tracking-[0.08em] uppercase shrink-0">
              <T k="events.afterMovie" />
            </h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-rs-yellow/60 to-transparent" />
          </div>

          <div className="relative aspect-video rounded-rs overflow-hidden border border-white/10">
            <iframe
              src="https://www.youtube-nocookie.com/embed/TFW_9FalOdY?rel=0&modestbranding=1"
              title="Sim Racing Expo 2025 — After Movie"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <p className="text-rs-muted text-sm mt-3">
            Sim Racing Expo 2025 — Dortmund, Germany
          </p>
        </div>

        {/* ── Past Events Gallery ── */}
        <div>
          {/* Section heading with yellow accent */}
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-rs-yellow font-display font-bold text-xl tracking-[0.08em] uppercase shrink-0">
              <T k="events.eventHighlights" />
            </h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-rs-yellow/60 to-transparent" />
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAST_EVENTS.map((event) => (
              <PastEventCard key={event.name} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
