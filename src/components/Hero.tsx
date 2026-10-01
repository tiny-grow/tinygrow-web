'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { HeroBanner } from '@/lib/supabase/types';

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
  const buttonLink = (banner?.button_link && banner.button_link !== '/shop') ? banner.button_link : '/new-arrivals';
  const imageUrl = banner?.image_url;

  const mobileBanners = (
    Array.isArray(banner?.mobile_banner_urls) && banner.mobile_banner_urls.length > 0
      ? banner.mobile_banner_urls
      : banner?.mobile_image_url
      ? [banner.mobile_image_url]
      : []
  ).filter(Boolean);

  const [activeMobileSlide, setActiveMobileSlide] = useState(0);

  useEffect(() => {
    if (mobileBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMobileSlide((prev) => (prev + 1) % mobileBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [mobileBanners.length]);

  const activeMobileImage = mobileBanners.length > 0
    ? mobileBanners[activeMobileSlide]
    : imageUrl;

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF4EF] min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center">
      {/* 1. Desktop Hero Background Image */}
      {imageUrl && (
        <div className="hidden sm:block absolute inset-0 w-full h-full z-0">
          <Image
            src={imageUrl}
            alt={fullTitle}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-transparent z-0 pointer-events-none" />
        </div>
      )}

      {/* 2. Mobile View Hero Background Image (Dedicated Mobile Banners if available, otherwise fallback) */}
      {activeMobileImage ? (
        <div className="block sm:hidden absolute inset-0 w-full h-full z-0 transition-opacity duration-500">
          <Image
            key={activeMobileImage}
            src={activeMobileImage}
            alt={fullTitle}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 z-0 pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-r from-[#F0F8FE] via-[#FFF5F3] to-[#FAF1EA]" />
      )}

      {/* Mobile Slide Indicator Dots (when multiple mobile banners exist) */}
      {mobileBanners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex sm:hidden items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {mobileBanners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveMobileSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeMobileSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* 2. Doodles only displayed when no custom image is uploaded */}
      {!imageUrl && (
        <>
          {/* Pink Heart Doodle (top-middle) */}
          <div className="absolute top-8 sm:top-12 left-[42%] sm:left-[43%] z-10 select-none pointer-events-none text-[#FB7185]/80 -rotate-12 hidden sm:block">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>

          {/* Mint Heart Doodle (above features) */}
          <div className="absolute bottom-28 sm:bottom-32 left-[36%] sm:left-[37%] z-10 select-none pointer-events-none text-[#34D399]/90 rotate-12 hidden sm:block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>

          {/* "for your little happiness" label with dashed curve (top-right) */}
          <div className="absolute top-6 sm:top-10 right-6 sm:right-16 z-10 flex flex-col items-center select-none pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm opacity-80">🕊️</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FB7185" strokeWidth="2.2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-[#FB7185] text-xs sm:text-sm font-extrabold tracking-tight text-center leading-tight">
              for<br />your little<br />happiness
            </span>
            <svg width="34" height="26" viewBox="0 0 40 30" fill="none" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" className="mt-1 opacity-70">
              <path d="M 5 2 C 15 20, 25 25, 35 15" strokeDasharray="3 3" />
              <path d="M 32 10 L 37 15 L 30 18" />
            </svg>
          </div>
        </>
      )}

      {/* 4. Text & Action Content on top of banner */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 sm:px-10 lg:px-16 py-10 sm:py-16 flex flex-col justify-between min-h-[480px] sm:min-h-[560px] lg:min-h-[620px]">
        {/* Top/Center Block: Badge, Title, Subtitle, CTA */}
        <div className="max-w-xl flex flex-col items-start pt-2 sm:pt-4">
          {/* Badge */}
          <div className="inline-flex items-center bg-[#D8ECF8] text-[#1E75BB] text-[11px] sm:text-xs font-bold tracking-wider px-3.5 py-1 rounded-full mb-3 sm:mb-4 shadow-2xs">
            {badgeText}
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight leading-[1.15] mb-3 sm:mb-4">
            <span className="text-[#38BDF8] block">{headingFirst}</span>
            {hasHighlight && (
              <span className="text-[#FB7185] block">{headingHighlight}</span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-[#475569] text-xs sm:text-base lg:text-[17px] max-w-md mb-5 sm:mb-7 leading-relaxed font-medium">
            {subtitle}
          </p>

          {/* Action Button */}
          <Link
            href={buttonLink}
            className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-base py-2.5 sm:py-3.5 px-6 sm:px-8 rounded-full shadow-lg shadow-pink-200/90 hover:shadow-xl hover:shadow-pink-300 transition-all active:scale-[0.98]"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* Bottom Block: 4 Feature Bullet Items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8 pt-6 sm:pt-10 max-w-2xl">
          {/* Feature 1: Leaf */}
          <div className="flex flex-col items-start sm:items-center text-left sm:text-center gap-1.5">
            <div className="text-[#1E293B] mb-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 4 13a11 11 0 0 1 11-11 7 7 0 0 1 7 7c0 5-4 9-11 11Z" />
                <path d="M4 13c7 0 11-4 11-11" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#1E293B] leading-tight">
              {banner?.feature_1_title ? (
                banner.feature_1_title
              ) : (
                <>Soft &amp; Safe<br className="hidden sm:inline" /> Materials</>
              )}
            </span>
          </div>

          {/* Feature 2: Shield */}
          <div className="flex flex-col items-start sm:items-center text-left sm:text-center gap-1.5">
            <div className="text-[#1E293B] mb-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#1E293B] leading-tight">
              {banner?.feature_2_title ? (
                banner.feature_2_title
              ) : (
                <>Gentle on<br className="hidden sm:inline" /> Baby&apos;s Skin</>
              )}
            </span>
          </div>

          {/* Feature 3: Truck */}
          <div className="flex flex-col items-start sm:items-center text-left sm:text-center gap-1.5">
            <div className="text-[#1E293B] mb-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#1E293B] leading-tight">
              {banner?.feature_3_title ? (
                banner.feature_3_title
              ) : (
                <>Fast &amp; Reliable<br className="hidden sm:inline" /> Delivery</>
              )}
            </span>
          </div>

          {/* Feature 4: Heart */}
          <div className="flex flex-col items-start sm:items-center text-left sm:text-center gap-1.5">
            <div className="text-[#1E293B] mb-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#1E293B] leading-tight">
              {banner?.feature_4_title ? (
                banner.feature_4_title
              ) : (
                <>Trusted<br className="hidden sm:inline" /> by Parents</>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
