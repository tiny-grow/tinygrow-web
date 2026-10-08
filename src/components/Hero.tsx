'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroBanner } from '@/lib/supabase/types';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';

interface HeroProps {
  banner?: HeroBanner | null;
}

export default function Hero({ banner }: HeroProps) {
  const badgeText = banner?.badge_text || 'NEW ARRIVALS';
  const fullTitle = banner?.title || 'Little Moments, Made to Grow';
  const headingHighlight = banner?.title_highlight || 'Made to Grow';
  const hasHighlight = Boolean(headingHighlight && fullTitle.includes(headingHighlight));
  const headingFirst = hasHighlight
    ? fullTitle.replace(headingHighlight, '').trim()
    : fullTitle;
  const subtitle =
    banner?.subtitle ||
    'Soft clothing, little accessories and joyful toys for your little ones.';
  const buttonText = banner?.button_text || 'Shop New Arrivals';
  const buttonLink =
    banner?.button_link && banner.button_link !== '/shop'
      ? banner.button_link
      : '/new-arrivals';

  // 1. Extract Desktop Banners (up to 2)
  let desktopBanners: string[] = [];
  if (Array.isArray(banner?.desktop_banner_urls) && banner.desktop_banner_urls.length > 0) {
    desktopBanners = banner.desktop_banner_urls.filter(Boolean);
  }

  // 2. Extract Mobile Banners (up to 2)
  let mobileBanners: string[] = [];
  if (Array.isArray(banner?.mobile_banner_urls) && banner.mobile_banner_urls.length > 0) {
    mobileBanners = banner.mobile_banner_urls.filter(Boolean);
  }

  // 3. Fallback: Check if description contains JSON with banners
  if (banner?.description && banner.description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(banner.description);
      if (desktopBanners.length === 0 && Array.isArray(parsed.desktop_banners)) {
        desktopBanners = parsed.desktop_banners.filter(Boolean);
      }
      if (mobileBanners.length === 0 && Array.isArray(parsed.mobile_banners)) {
        mobileBanners = parsed.mobile_banners.filter(Boolean);
      }
    } catch {
      // Not JSON
    }
  }

  // 4. Native single columns fallback
  if (desktopBanners.length === 0 && banner?.image_url) {
    desktopBanners = [banner.image_url];
  }
  if (mobileBanners.length === 0 && banner?.mobile_image_url) {
    mobileBanners = [banner.mobile_image_url];
  }

  // Cap at 2 banners each
  const finalDesktopBanners = desktopBanners.slice(0, 2);
  const finalMobileBanners = (
    mobileBanners.length > 0 ? mobileBanners : finalDesktopBanners
  ).slice(0, 2);

  // Desktop Slider State
  const [activeDesktopSlide, setActiveDesktopSlide] = useState(0);
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);

  // Mobile Slider State
  const [activeMobileSlide, setActiveMobileSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto-rotate desktop banners every 5s if 2 banners exist (pauses on hover)
  useEffect(() => {
    if (finalDesktopBanners.length <= 1 || isDesktopHovered) return;
    const interval = setInterval(() => {
      setActiveDesktopSlide((prev) => (prev + 1) % finalDesktopBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [finalDesktopBanners.length, isDesktopHovered]);

  // Auto-rotate mobile banners every 4.5s if 2 banners exist
  useEffect(() => {
    if (finalMobileBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMobileSlide((prev) => (prev + 1) % finalMobileBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [finalMobileBanners.length]);

  const handleNextDesktop = () => {
    setActiveDesktopSlide((prev) => (prev + 1) % finalDesktopBanners.length);
  };

  const handlePrevDesktop = () => {
    setActiveDesktopSlide(
      (prev) => (prev - 1 + finalDesktopBanners.length) % finalDesktopBanners.length
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || finalMobileBanners.length <= 1) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      // Swiped left -> next
      setActiveMobileSlide((prev) => (prev + 1) % finalMobileBanners.length);
    } else if (diff < -45) {
      // Swiped right -> prev
      setActiveMobileSlide(
        (prev) => (prev - 1 + finalMobileBanners.length) % finalMobileBanners.length
      );
    }
    setTouchStartX(null);
  };

  const hasDesktopImages = finalDesktopBanners.length > 0;
  const hasMobileImages = finalMobileBanners.length > 0;

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF4EF]">
      {/* ========================================================================= */}
      {/* DESKTOP VIEW (screens >= 640px)                                           */}
      {/* ========================================================================= */}
      <div
        className="hidden sm:flex relative w-full min-h-[520px] lg:min-h-[600px] items-center group"
        onMouseEnter={() => setIsDesktopHovered(true)}
        onMouseLeave={() => setIsDesktopHovered(false)}
      >
        {/* Desktop Banner Carousel Background */}
        {hasDesktopImages ? (
          <>
            {finalDesktopBanners.map((imgUrl, idx) => (
              <div
                key={imgUrl + idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  idx === activeDesktopSlide
                    ? 'opacity-100 z-0'
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <Image
                  src={getOptimizedImageUrl(imgUrl, { width: 1920 })}
                  alt={`${fullTitle} - Banner ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  unoptimized
                  sizes="100vw"
                  className="object-cover object-right"
                />
              </div>
            ))}

            {/* Desktop Navigation Arrows (shown if 2 banners) */}
            {finalDesktopBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevDesktop}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Previous Desktop Banner"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={handleNextDesktop}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Next Desktop Banner"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>

                {/* Desktop Indicator Dots */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs">
                  {finalDesktopBanners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveDesktopSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeDesktopSlide
                          ? 'w-6 bg-[#FB7185]'
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to desktop banner slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* Fallback when no desktop image uploaded: pastel gradient */
          <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-r from-[#F0F8FE] via-[#FFF5F3] to-[#FAF1EA]" />
        )}

        {/* Decorative doodles when no custom image */}
        {!hasDesktopImages && (
          <>
            <div className="absolute top-8 sm:top-12 left-[43%] z-10 select-none pointer-events-none text-[#FB7185]/80 -rotate-12">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div className="absolute bottom-32 left-[37%] z-10 select-none pointer-events-none text-[#34D399]/90 rotate-12">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div className="absolute top-10 right-16 z-10 flex flex-col items-center select-none pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm opacity-80">🕊️</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FB7185" strokeWidth="2.2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="text-[#FB7185] text-sm font-extrabold tracking-tight text-center leading-tight">
                for<br />your little<br />happiness
              </span>
            </div>
          </>
        )}

        {/* Desktop Foreground Content (Title, Subtitle, CTA, Feature Pillars) */}
        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 flex flex-col justify-between min-h-[520px] lg:min-h-[600px]">
          <div className="max-w-xl flex flex-col items-start pt-2">
            <div className="inline-flex items-center bg-[#D8ECF8] text-[#1E75BB] text-xs font-bold tracking-wider px-3.5 py-1 rounded-full mb-4 shadow-2xs">
              {badgeText}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.15] mb-4">
              <span className="text-[#38BDF8] block">{headingFirst}</span>
              {hasHighlight && (
                <span className="text-[#FB7185] block">{headingHighlight}</span>
              )}
            </h1>

            <p className="text-[#475569] text-sm sm:text-base max-w-md mb-7 leading-relaxed font-medium">
              {subtitle}
            </p>

            <Link
              href={buttonLink}
              className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-sm sm:text-base py-3 px-8 rounded-full shadow-lg shadow-pink-200/90 hover:shadow-xl hover:shadow-pink-300 transition-all active:scale-[0.98]"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          {/* Desktop 4 Feature Bullet Items */}
          <div className="grid grid-cols-4 gap-6 pt-8 max-w-2xl">
            <div className="flex flex-col items-start text-left gap-1">
              <div className="text-[#1E293B] mb-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 4 13a11 11 0 0 1 11-11 7 7 0 0 1 7 7c0 5-4 9-11 11Z" />
                  <path d="M4 13c7 0 11-4 11-11" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#1E293B] leading-tight">
                {banner?.feature_1_title || 'Soft & Safe Materials'}
              </span>
            </div>

            <div className="flex flex-col items-start text-left gap-1">
              <div className="text-[#1E293B] mb-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#1E293B] leading-tight">
                {banner?.feature_2_title || "Gentle on Baby's Skin"}
              </span>
            </div>

            <div className="flex flex-col items-start text-left gap-1">
              <div className="text-[#1E293B] mb-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#1E293B] leading-tight">
                {banner?.feature_3_title || 'Fast & Reliable Delivery'}
              </span>
            </div>

            <div className="flex flex-col items-start text-left gap-1">
              <div className="text-[#1E293B] mb-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#1E293B] leading-tight">
                {banner?.feature_4_title || 'Trusted by Parents'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEW (screens < 640px)                                             */}
      {/* ========================================================================= */}
      <div className="block sm:hidden w-full">
        {/* Mobile Banner Card / Carousel */}
        <div
          className="relative w-full overflow-hidden bg-slate-100"
          style={{ height: '420px' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {hasMobileImages ? (
            <>
              {finalMobileBanners.map((mImg, mIdx) => (
                <div
                  key={mImg + mIdx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                    mIdx === activeMobileSlide
                      ? 'opacity-100 z-0'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <Image
                    src={getOptimizedImageUrl(mImg, { width: 900 })}
                    alt={`${fullTitle} - Mobile Banner ${mIdx + 1}`}
                    fill
                    priority={mIdx === 0}
                    fetchPriority={mIdx === 0 ? 'high' : 'auto'}
                    unoptimized
                    sizes="100vw"
                    className="object-cover"
                    style={{ objectPosition: '30% top' }}
                  />
                  {/* Subtle bottom fade — keeps text readable, image still vivid */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, transparent 62%)',
                    }}
                  />
                </div>
              ))}

              {/* Mobile Slide Indicator Dots */}
              {finalMobileBanners.length > 1 && (
                <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                  {finalMobileBanners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveMobileSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeMobileSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                      aria-label={`Go to mobile slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Text overlay — pinned to bottom */}
              <div className="absolute bottom-[18%] left-0 right-0 z-10 px-5 flex flex-col">
                {badgeText && (
                  <div className="inline-flex items-center bg-white/95 backdrop-blur-sm text-[#FB7185] text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full mb-2 w-fit shadow-xs">
                    {badgeText}
                  </div>
                )}

                <h1 className="text-[22px] font-extrabold leading-snug mb-1.5 drop-shadow-lg">
                  <span className="block text-white">{headingFirst}</span>
                  {hasHighlight && (
                    <span className="block text-[#FBCFE8]">{headingHighlight}</span>
                  )}
                </h1>

                {subtitle && (
                  <p className="text-white/85 text-xs font-medium mb-4 drop-shadow-sm max-w-[230px] leading-relaxed">
                    {subtitle}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <Link
                    href={buttonLink}
                    className="inline-flex items-center gap-1.5 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-lg shadow-pink-900/40 transition-transform active:scale-95"
                  >
                    <span>{buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {finalMobileBanners.length > 1 && (
                    <span className="text-[10px] text-white/75 font-medium ml-auto">
                      Swipe for more &rarr;
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Fallback when no mobile banner uploaded */
            <div className="relative w-full h-full bg-gradient-to-r from-[#F0F8FE] via-[#FFF5F3] to-[#FAF1EA] p-6 flex flex-col justify-end pb-8">
              <div className="inline-flex items-center bg-[#D8ECF8] text-[#1E75BB] text-[11px] font-bold tracking-wider px-3 py-1 rounded-full mb-3 w-fit">
                {badgeText}
              </div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] leading-tight mb-2">
                <span className="text-[#38BDF8] block">{headingFirst}</span>
                {hasHighlight && (
                  <span className="text-[#FB7185] block">{headingHighlight}</span>
                )}
              </h1>
              <p className="text-slate-600 text-xs font-medium mb-4 leading-relaxed">
                {subtitle}
              </p>
              <Link
                href={buttonLink}
                className="inline-flex items-center gap-1.5 bg-[#FB7185] text-white font-bold text-xs py-2.5 px-6 rounded-full w-fit shadow-md"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>


        {/* Mobile 4 Feature Bullet Items (Clean Trust Bar Below Banner) */}
        <div className="bg-white border-b border-slate-100 px-4 py-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
              <div className="text-[#0284C7] shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 4 13a11 11 0 0 1 11-11 7 7 0 0 1 7 7c0 5-4 9-11 11Z" />
                  <path d="M4 13c7 0 11-4 11-11" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {banner?.feature_1_title || 'Soft Materials'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
              <div className="text-[#FB7185] shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {banner?.feature_2_title || 'Gentle on Skin'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
              <div className="text-emerald-600 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {banner?.feature_3_title || 'Fast Delivery'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
              <div className="text-amber-500 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {banner?.feature_4_title || 'Trusted by Parents'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
