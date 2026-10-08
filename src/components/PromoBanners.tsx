import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Promotion } from '@/lib/supabase/types';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';

interface PromoBannersProps {
  promotions?: Promotion[];
}

export default function PromoBanners({ promotions = [] }: PromoBannersProps) {
  const specialOffersPromo = promotions.find((p) => p.card_key === 'special_offers');
  const comfortPromo = promotions.find((p) => p.card_key === 'comfort_today');

  const specialOffersImage =
    specialOffersPromo?.image_url ||
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1000&auto=format&fit=crop';

  const comfortImage =
    comfortPromo?.image_url ||
    'https://images.unsplash.com/photo-1544126592-807ade215a0b?q=80&w=1000&auto=format&fit=crop';

  // Card 1: Shop Now goes to All Products (/shop)
  const specialOffersLink =
    specialOffersPromo?.button_link && specialOffersPromo.button_link !== '/shop?filter=offers'
      ? specialOffersPromo.button_link
      : '/shop';

  // Card 2: Explore goes to Accessories (/category/accessories)
  const comfortLink =
    !comfortPromo?.button_link ||
    comfortPromo.button_link === '/shop' ||
    comfortPromo.button_link === '/category/dresses'
      ? '/category/accessories'
      : comfortPromo.button_link;

  return (
    <section className="px-4 sm:px-8 lg:px-12 py-5 sm:py-6 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">

        {/* ── Left Promo Card: Special Offers ── */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[200px] sm:min-h-[250px] lg:h-[265px] shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-end">
          {/* Full image card shifted to the left: cardigan/flowers on the left */}
          <div className="absolute inset-y-0 -left-[12%] sm:-left-[20%] lg:-left-[26%] w-[130%] sm:w-[142%] lg:w-[152%] h-full z-0 pointer-events-none">
            <Image
              src={getOptimizedImageUrl(specialOffersImage, { width: 900 })}
              alt={specialOffersPromo?.title || 'Special Offers'}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-left"
            />
          </div>

          {/* Soft color-matched backdrop gradient on the right to make text 100% visible */}
          <div className="absolute inset-y-0 right-0 w-[58%] sm:w-[50%] bg-gradient-to-l from-[#FAF7F2]/90 via-[#FAF7F2]/60 to-transparent pointer-events-none z-0" />

          {/* Texts positioned on the right side */}
          <div className="relative z-10 w-[54%] sm:w-[48%] lg:w-[44%] p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-start ml-auto">
            {/* Matching top alignment doodle */}
            <div className="h-5 sm:h-6 mb-1.5 sm:mb-2 flex items-center text-[#FB7185] pointer-events-none select-none">
              <svg width="20" height="20" className="sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>

            <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#FB7185] tracking-tight leading-tight mb-1 sm:mb-2 whitespace-pre-line">
              {specialOffersPromo?.title || 'Special Offers'}
            </h3>
            <p className="text-xs sm:text-xs lg:text-sm text-slate-700 font-medium mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none leading-relaxed">
              {specialOffersPromo?.subtitle || 'For your little happiness'}
            </p>
            <Link
              href={specialOffersLink}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-semibold text-xs sm:text-xs py-2 sm:py-2.5 px-4 sm:px-6 rounded-full shadow-md shadow-pink-200/50 transition-all active:scale-[0.98]"
            >
              <span>{specialOffersPromo?.button_text || 'Shop Now'}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* ── Right Promo Card: Comfort Today ── */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[200px] sm:min-h-[250px] lg:h-[265px] shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-start">
          {/* Full image card with baby on the right */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <Image
              src={getOptimizedImageUrl(comfortImage, { width: 900 })}
              alt={comfortPromo?.title || 'Comfort Today'}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-right"
            />

            {/* Whimsical line art overlay */}
            <div className="absolute top-4 right-4 text-white/70 pointer-events-none select-none hidden sm:block">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
              </svg>
            </div>
          </div>

          {/* Soft color-matched backdrop gradient on the left to make text 100% visible */}
          <div className="absolute inset-y-0 left-0 w-[58%] sm:w-[50%] bg-gradient-to-r from-[#E3F2FD]/90 via-[#E3F2FD]/60 to-transparent pointer-events-none z-0" />

          {/* Texts positioned on the left side */}
          <div className="relative z-10 w-[54%] sm:w-[48%] lg:w-[44%] p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-start mr-auto">
            {/* Matching top alignment doodle */}
            <div className="h-5 sm:h-6 mb-1.5 sm:mb-2 flex items-center text-[#FB7185] pointer-events-none select-none">
              <svg width="20" height="20" className="sm:w-[22px] sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>

            <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#0284C7] tracking-tight leading-tight mb-1 sm:mb-2 whitespace-pre-line">
              {comfortPromo?.title || 'Comfort Today'}
            </h3>
            <p className="text-xs sm:text-xs lg:text-sm text-slate-700 font-medium mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none leading-relaxed">
              {comfortPromo?.tagline || comfortPromo?.subtitle || 'Ultra-soft daily wear essentials'}
            </p>
            <Link
              href={comfortLink}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs sm:text-xs py-2 sm:py-2.5 px-4 sm:px-6 rounded-full shadow-md shadow-sky-200/50 transition-all active:scale-[0.98]"
            >
              <span>{comfortPromo?.button_text || 'Explore'}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
