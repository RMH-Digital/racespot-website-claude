'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PastEvent {
  name: string
  year: string
  location: string
  images: string[]
}

interface Labels {
  photo: string
  prev: string
  next: string
}

export default function PastEventCard({ event, labels }: { event: PastEvent; labels: Labels }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultiple = event.images.length > 1

  const goLeft = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev - 1 + event.images.length) % event.images.length)
  }

  const goRight = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev + 1) % event.images.length)
  }

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden rounded-rs
                 border-2 border-transparent hover:border-rs-yellow
                 transition-all duration-300 ease-out cursor-pointer"
    >
      {/* All images stacked, crossfade on active */}
      {event.images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`${event.name} – ${labels.photo} ${i + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-all duration-700 ease-out
                      ${i === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        />
      ))}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.05) 70%, transparent 100%)',
        }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-rs-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Left / Right arrow buttons - appear on hover */}
      {hasMultiple && (
        <>
          <button
            onClick={goLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                       w-8 h-8 flex items-center justify-center
                       bg-rs-black/60 backdrop-blur-sm rounded-full
                       border border-white/20 text-white/80
                       opacity-0 group-hover:opacity-100
                       hover:bg-rs-yellow hover:text-rs-black hover:border-rs-yellow
                       transition-all duration-300"
            aria-label={labels.prev}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                       w-8 h-8 flex items-center justify-center
                       bg-rs-black/60 backdrop-blur-sm rounded-full
                       border border-white/20 text-white/80
                       opacity-0 group-hover:opacity-100
                       hover:bg-rs-yellow hover:text-rs-black hover:border-rs-yellow
                       transition-all duration-300"
            aria-label={labels.next}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Year badge */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className="inline-block bg-rs-black/70 backdrop-blur-sm text-rs-yellow
                     text-[11px] font-display font-bold tracking-[0.1em] uppercase
                     px-3 py-1.5 rounded-rs border border-rs-yellow/30
                     group-hover:bg-rs-yellow group-hover:text-rs-black
                     transition-all duration-300"
        >
          {event.year}
        </span>
      </div>

      {/* Content overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
        {/* Yellow accent bar */}
        <div className="w-8 h-[3px] bg-rs-yellow mb-3 group-hover:w-12 transition-all duration-300" />

        {/* Event name */}
        <h3
          className="font-display font-bold text-white text-[15px] leading-tight
                     tracking-[0.02em] uppercase mb-1.5
                     group-hover:text-rs-yellow transition-colors duration-300"
        >
          {event.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2">
          <svg
            className="w-3 h-3 text-rs-muted group-hover:text-rs-yellow/70 transition-colors duration-300 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-rs-muted text-xs tracking-wide group-hover:text-white/70 transition-colors duration-300">
            {event.location}
          </p>
        </div>

        {/* Dot indicators - appear on hover */}
        {hasMultiple && (
          <div
            className="flex items-center gap-1.5 mt-3 opacity-0 translate-y-2
                       group-hover:opacity-100 group-hover:translate-y-0
                       transition-all duration-300 delay-75"
          >
            {event.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex(i)
                }}
                className={`h-1 rounded-full transition-all duration-300
                  ${i === activeIndex
                    ? 'w-4 bg-rs-yellow'
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
