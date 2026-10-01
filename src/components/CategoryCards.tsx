'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Category } from '@/lib/supabase/types';

interface CategoryCardsProps {
  categories: Category[];
}

const CARD_THEMES = [
  {
    bg: 'bg-[#FCEEEB]',
    btnBg: 'bg-[#FF6B8B] hover:bg-[#F43F5E]',
    borderColor: 'border-[#F8D5CE]/60',
    defaultDesc: 'Adorable outfits for every moment',
    fallbackEmoji: '👗',
  },
  {
    bg: 'bg-[#F7EFE6]',
    btnBg: 'bg-[#38BDF8] hover:bg-[#0284C7]',
    borderColor: 'border-[#EFE1CC]/60',
    defaultDesc: 'Little essentials for everyday care',
    fallbackEmoji: '🍼',
  },
  {
    bg: 'bg-[#F3F6ED]',
    btnBg: 'bg-[#34D399] hover:bg-[#10B981]',
    borderColor: 'border-[#DCEDD3]/60',
    defaultDesc: 'Play, learn and grow',
    fallbackEmoji: '🧸',
  },
  {
    bg: 'bg-[#FDF2F4]',
    btnBg: 'bg-[#FB7185] hover:bg-[#E11D48]',
    borderColor: 'border-pink-200/60',
    defaultDesc: 'Sweet comforts for little ones',
    fallbackEmoji: '🎀',
  },
  {
    bg: 'bg-[#EFF6FF]',
    btnBg: 'bg-[#3B82F6] hover:bg-[#1D4ED8]',
    borderColor: 'border-blue-200/60',
    defaultDesc: 'Cozy layers and daily wear',
    fallbackEmoji: '✨',
  },
  {
    bg: 'bg-[#FFFBEB]',
    btnBg: 'bg-[#F59E0B] hover:bg-[#D97706]',
    borderColor: 'border-amber-200/60',
    defaultDesc: 'Joyful surprises and gifts',
    fallbackEmoji: '🌟',
  },
];

export default function CategoryCards({ categories }: CategoryCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const touchStartX = useRef<number | null>(null);

  // Responsive visible count tracking
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Only display primary featured collections on the homepage (Dresses, Accessories, Toys)
  // Exclude dress types/subcategories like 'traditional', 'casual', 'party', etc.
  const displayCategories = (categories || []).filter((cat) => {
    const slug = (cat.slug || '').toLowerCase().trim();
    const name = (cat.name || '').toLowerCase().trim();

    // Reject subcategory tags
    const isSubcategory =
      slug === 'traditional' ||
      name === 'traditional' ||
      slug.includes('casual') ||
      name.includes('casual') ||
      slug.includes('party') ||
      name.includes('party') ||
      slug.includes('romper') ||
      name.includes('romper') ||
      slug.includes('frock') ||
      name.includes('frock');

    if (isSubcategory) return false;

    // Only allow main collections or categories with an uploaded banner/image
    const isMainCollection =
      slug.includes('dress') ||
      name.includes('dress') ||
      slug.includes('accessor') ||
      name.includes('accessor') ||
      slug.includes('toy') ||
      name.includes('toy');

    return isMainCollection || Boolean(cat.image_url);
  });

  if (!displayCategories || displayCategories.length === 0) {
    return (
      <section className="px-4 sm:px-8 lg:px-12 py-5 bg-white">
        <div className="max-w-7xl mx-auto p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-500 text-xs">
          No categories configured yet. Categories added in the Admin panel will appear here.
        </div>
      </section>
    );
  }

  const totalCategories = displayCategories.length;
  // Sliding activates if there are more categories than visible on screen
  const shouldSlide = totalCategories > visibleCount;
  const maxIndex = Math.max(0, totalCategories - visibleCount);

  // Automatic sliding timer
  useEffect(() => {
    if (!shouldSlide || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(interval);
  }, [shouldSlide, isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section className="px-4 sm:px-8 lg:px-12 py-5 sm:py-6 bg-white relative">
      <div
        className="max-w-7xl mx-auto relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel Container */}
        <div className="overflow-hidden rounded-[24px] sm:rounded-[28px]">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: shouldSlide
                ? `translateX(-${currentIndex * (100 / visibleCount)}%)`
                : 'none',
            }}
          >
            {displayCategories.map((cat, idx) => {
              const theme = CARD_THEMES[idx % CARD_THEMES.length];
              const description = cat.description || theme.defaultDesc;

              return (
                <div
                  key={cat.id || cat.slug || idx}
                  className="shrink-0 px-2 sm:px-2.5"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    className={`group relative overflow-hidden rounded-[26px] ${theme.bg} border ${theme.borderColor} h-[185px] sm:h-[195px] lg:h-[205px] flex items-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 select-none`}
                  >
                    {/* Background image shifted nicely to give space for text while keeping subject visible */}
                    {cat.image_url ? (
                      <div className="absolute inset-y-0 -left-[4%] sm:-left-[6%] lg:-left-[8%] w-[114%] sm:w-[118%] lg:w-[122%] h-full z-0 overflow-hidden pointer-events-none">
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 140vw, (max-width: 1024px) 70vw, 45vw"
                          className="object-cover object-left transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      /* Fallback Icon on the left side */
                      <div className="absolute top-1/2 -translate-y-1/2 left-6 sm:left-8 z-0 pointer-events-none transition-transform duration-300 group-hover:scale-110">
                        <ShoppingBag className="w-14 h-14 sm:w-16 sm:h-16 text-slate-400/50 stroke-[1.2]" />
                      </div>
                    )}

                    {/* Perfectly aligned Text Area on the right */}
                    <div className="relative z-10 w-[52%] sm:w-[48%] lg:w-[46%] ml-auto flex flex-col justify-center items-start h-full py-4 pr-5 sm:pr-7 pl-2">
                      {/* Title */}
                      <h3 className="font-extrabold text-lg sm:text-xl lg:text-[22px] text-[#0F2942] tracking-tight leading-tight mb-1.5 line-clamp-1">
                        {cat.name}
                      </h3>

                      {/* Subtitle / Description with uniform height for alignment */}
                      <p className="text-xs sm:text-[13px] text-[#475569] font-medium leading-snug line-clamp-2 mb-3.5 h-[34px] flex items-start">
                        {description}
                      </p>

                      {/* CTA "Shop Now ->" with matching circular button */}
                      <div className="inline-flex items-center gap-2 group-hover:gap-2.5 transition-all">
                        <span className="text-xs sm:text-[13px] font-bold text-[#0F2942]">
                          Shop Now
                        </span>
                        <span
                          className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full ${theme.btnBg} text-white flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5 shrink-0`}
                        >
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows & pagination dots when sliding is enabled */}
        {shouldSlide && (
          <div className="flex items-center justify-between mt-3 px-2">
            {/* Dots */}
            <div className="flex items-center gap-1.5 mx-auto">
              {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === dotIdx
                      ? 'w-6 bg-[#FB7185]'
                      : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Slide to category page ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Subtle arrows */}
            <div className="flex items-center gap-1.5 absolute right-2 -top-1 sm:-top-2">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#FB7185] hover:border-pink-200 shadow-2xs transition-colors"
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#FB7185] hover:border-pink-200 shadow-2xs transition-colors"
                aria-label="Next categories"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
