'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Announcement } from '@/types/database'

interface HeroBannerProps {
  banners: Announcement[]
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalSlides = banners.length

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Auto-play: 5 saniyede bir gecis
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(goToNext, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [totalSlides, isPaused, goToNext])

  // Banner yoksa fallback hero goster
  if (totalSlides === 0) {
    return (
      <section className="bg-gradient-to-br from-navy-800 via-navy-700 to-iznik-800 text-white py-20 md:py-28 iznik-pattern">
        {/* Dekoratif cini motifleri - sol */}
        <svg className="absolute -left-6 lg:left-8 top-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.05] pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="2"/>
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1.5"/>
          <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="1"/>
          <ellipse cx="100" cy="40" rx="10" ry="25" fill="white"/>
          <ellipse cx="100" cy="160" rx="10" ry="25" fill="white"/>
          <ellipse cx="40" cy="100" rx="25" ry="10" fill="white"/>
          <ellipse cx="160" cy="100" rx="25" ry="10" fill="white"/>
          <ellipse cx="55" cy="55" rx="8" ry="18" fill="white" transform="rotate(-45 55 55)"/>
          <ellipse cx="145" cy="55" rx="8" ry="18" fill="white" transform="rotate(45 145 55)"/>
          <ellipse cx="55" cy="145" rx="8" ry="18" fill="white" transform="rotate(45 55 145)"/>
          <ellipse cx="145" cy="145" rx="8" ry="18" fill="white" transform="rotate(-45 145 145)"/>
          <circle cx="100" cy="100" r="8" fill="white"/>
        </svg>

        {/* Dekoratif cini motifleri - sag */}
        <svg className="absolute -right-6 lg:right-8 top-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.05] pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none">
          <rect x="20" y="20" width="160" height="160" rx="10" stroke="white" strokeWidth="2"/>
          <rect x="50" y="50" width="100" height="100" rx="6" stroke="white" strokeWidth="1.5"/>
          <circle cx="100" cy="100" r="35" stroke="white" strokeWidth="1.5"/>
          <ellipse cx="100" cy="55" rx="8" ry="20" fill="white"/>
          <ellipse cx="100" cy="145" rx="8" ry="20" fill="white"/>
          <ellipse cx="55" cy="100" rx="20" ry="8" fill="white"/>
          <ellipse cx="145" cy="100" rx="20" ry="8" fill="white"/>
          <circle cx="100" cy="100" r="6" fill="white"/>
          <circle cx="35" cy="35" r="8" fill="white" opacity="0.5"/>
          <circle cx="165" cy="35" r="8" fill="white" opacity="0.5"/>
          <circle cx="35" cy="165" r="8" fill="white" opacity="0.5"/>
          <circle cx="165" cy="165" r="8" fill="white" opacity="0.5"/>
        </svg>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* Ust dekoratif cizgi */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-iznik-400/50" />
            <svg className="w-6 h-6 text-iznik-400 opacity-60" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="0.8"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-iznik-400/50" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
            İznik&apos;i İznikle
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-iznik-300 to-iznik-100">Keşfet</span>
          </h2>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-2">
            Çini sanatçılarından yöresel lezzetlere, el sanatlarından teknik servislere —
            İznik&apos;in tüm esnaf ve işletmeleri tek bir platformda.
          </p>

          {/* Alt dekoratif cizgi */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-iznik-400/40" />
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-iznik-400/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-iznik-400/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-iznik-400/40" />
            </div>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-iznik-400/40" />
          </div>
        </div>
      </section>
    )
  }

  // Banner slider
  return (
    <section
      className="group relative w-full overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sabit yukseklik + object-contain: gorsel tamamen gorunur */}
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] lg:h-[420px]">
        {/* Slider track */}
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => {
            const imgElement = (
              <img
                src={banner.image_url}
                alt={banner.title || 'Banner'}
                className="w-full h-full object-contain"
                draggable={false}
              />
            )

            return (
              <div
                key={banner.id}
                className="relative w-full h-full flex-shrink-0"
                style={{ minWidth: '100%' }}
              >
                {banner.link_url ? (
                  <a
                    href={banner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    {imgElement}
                  </a>
                ) : (
                  imgElement
                )}

                {/* Baslik overlay */}
                {banner.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-4 pb-10 pt-16 sm:px-6 md:px-10 md:pb-12 md:pt-20 z-[1]">
                    <h2 className="text-white text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold drop-shadow-lg max-w-4xl leading-snug">
                      {banner.title}
                    </h2>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigasyon noktalari (dots) */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 sm:w-8 h-2.5 sm:h-3 bg-white shadow-md'
                  : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Sol/Sag oklar — hover & mobilde her zaman gorunur */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 sm:bg-black/20 hover:bg-black/50 text-white flex items-center justify-center transition-all z-10 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Onceki"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 sm:bg-black/20 hover:bg-black/50 text-white flex items-center justify-center transition-all z-10 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Sonraki"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  )
}
