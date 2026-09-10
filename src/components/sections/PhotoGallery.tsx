import Image from 'next/image'
import { getT, type Lang } from '@/lib/i18n'

const GALLERY = [
  { src: '/images/gallery/Coke_Interlagos_Sprint_1_030425.jpg', alt: 'NASCAR Coke Series at Interlagos', span: 'col-span-2 row-span-2' },
  { src: '/images/gallery/F4-R7-28.jpeg', alt: 'F4 Esports side-by-side racing', span: '' },
  { src: '/images/gallery/IMSAEsports_R4_EMM-1.jpg', alt: 'IMSA Esports night race at Daytona', span: '' },
  { src: '/images/gallery/GRAB_034.jpeg', alt: 'LMP prototypes on track', span: '' },
  { src: '/images/gallery/mkexTJ35SZ2PESn.jpg', alt: 'NASCAR pack racing overhead view', span: '' },
]

export function PhotoGallery({ lang }: { lang: Lang }) {
  const t = getT(lang)

  return (
    <section className="section">
      <div className="container-rs">
        <div className="flex items-end justify-between mb-9">
          <div>
            <p className="section-label mb-2">{t('gallery.label')}</p>
            <h2 className="section-title">{t('gallery.title')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3">
          {GALLERY.map((img, i) => (
            <div
              key={i}
              className={`relative rounded-rs overflow-hidden group cursor-pointer ${img.span}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-rs-black/0 group-hover:bg-rs-black/30 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-rs-black/80 backdrop-blur-sm rounded px-3 py-1.5">
                  <p className="text-white text-xs font-medium">{img.alt}</p>
                </div>
              </div>
              {/* Yellow accent corner */}
              <div className="absolute top-0 left-0 w-0 h-0 group-hover:w-8 group-hover:h-8 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-rs-yellow" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-rs-yellow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
