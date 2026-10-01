import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { AboutSection } from '@/lib/supabase/types';

interface TinyEssentialsProps {
  about?: AboutSection | null;
}

export default function TinyEssentials({ about }: TinyEssentialsProps) {
  const fullTitle = about?.title || 'Tiny Essentials for a Happier Tomorrow';
  const description =
    about?.description ||
    'Crafted with love and utmost care, our organic essentials provide the gentlest touch for your baby’s everyday journey.';
  const buttonText = about?.button_text || 'Explore Now';
  const buttonLink =
    about?.button_link && about.button_link !== '/new-arrivals' ? about.button_link : '/shop';
  const imageUrl =
    about?.image_url ||
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200&auto=format&fit=crop';

  // Split title: "Tiny Essentials" in blue and "for a Happier Tomorrow" in navy
  const hasFor = fullTitle.toLowerCase().includes('for a');
  const titlePart1 = hasFor
    ? fullTitle.substring(0, fullTitle.toLowerCase().indexOf('for a')).trim()
    : 'Tiny Essentials';
  const titlePart2 = hasFor
    ? fullTitle.substring(fullTitle.toLowerCase().indexOf('for a')).trim()
    : fullTitle.replace(/tiny essentials/i, '').trim() || 'for a Happier Tomorrow';

  return (
    <section className="px-4 sm:px-8 lg:px-12 py-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* ── Main Banner with Full Image, Left Content & Right Icons in Empty Space ── */}
        <div className="relative w-full rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[340px] lg:h-[350px] flex flex-col md:flex-row items-center justify-between shadow-xs bg-[#FFFBF7] md:bg-transparent border border-orange-100/60 md:border-0">
          {/* Desktop Background Photo across full card shifted slightly right */}
          <div className="hidden md:block absolute inset-y-0 left-0 w-[114%] sm:w-[120%] lg:w-[125%] h-full z-0 overflow-hidden pointer-events-none">
            <Image
              src={imageUrl}
              alt={fullTitle}
              fill
              priority
              unoptimized
              sizes="(max-width: 1280px) 125vw, 1400px"
              className="object-cover object-left"
            />
            {/* Desktop backdrop overlay for perfect text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent z-0 pointer-events-none" />
          </div>

          {/* Whimsical hand-drawn doodles around the baby */}
          <div className="absolute top-6 left-[50%] text-[#FB7185] pointer-events-none select-none hidden lg:block -rotate-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <div className="absolute top-8 left-[63%] text-[#38BDF8] pointer-events-none select-none hidden lg:block rotate-12">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>

          {/* Left Side: Text, Description & Button */}
          <div className="relative z-10 p-5 sm:p-10 lg:p-12 flex flex-col items-start justify-center max-w-md sm:max-w-lg">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              <span className="text-[#0284C7] block">{titlePart1}</span>
              <span className="text-[#0F172A] block text-xl sm:text-2xl lg:text-3xl font-bold">{titlePart2}</span>
            </h2>

            {description && (
              <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium mb-6 leading-relaxed max-w-sm sm:max-w-md">
                {description}
              </p>
            )}

            <Link
              href={buttonLink}
              className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 px-6 sm:px-7 rounded-full shadow-md shadow-pink-300/40 transition-all active:scale-[0.98]"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          {/* Mobile View Image: Displays prominently in mobile view only */}
          <div className="w-full px-5 py-2 md:hidden z-10">
            <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden shadow-xs border border-orange-100/50">
              <Image
                src={imageUrl}
                alt={fullTitle}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right Side: 4 Feature Highlights */}
          <div className="relative z-10 p-5 md:p-6 lg:p-8 self-center mr-0 md:mr-4 lg:mr-8 w-full md:w-auto flex justify-center">
            <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-5 sm:gap-y-6 max-w-[300px] w-full bg-white/80 md:bg-transparent p-4 md:p-0 rounded-2xl border border-orange-100/40 md:border-0 shadow-xs md:shadow-none">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="text-[#0F172A] mb-1.5 flex items-center justify-center h-7">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="2.5" r="0.8" fill="currentColor" />
                    <circle cx="7" cy="4" r="0.7" fill="currentColor" />
                    <circle cx="17" cy="4" r="0.7" fill="currentColor" />
                    <polygon points="6 8 18 8 21 12 12 21 3 12 6 8" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="9" y1="8" x2="12" y2="21" />
                    <line x1="15" y1="8" x2="12" y2="21" />
                    <line x1="9" y1="8" x2="12" y2="12" />
                    <line x1="15" y1="8" x2="12" y2="12" />
                  </svg>
                </div>
                <p className="text-[11px] lg:text-xs font-bold text-[#0F172A] leading-tight">
                  Premium<br />Quality
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="text-[#0F172A] mb-1.5 flex items-center justify-center h-7">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <p className="text-[11px] lg:text-xs font-bold text-[#0F172A] leading-tight">
                  Baby Safe<br />Materials
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="text-[#0F172A] mb-1.5 flex items-center justify-center h-7">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6" />
                  </svg>
                </div>
                <p className="text-[11px] lg:text-xs font-bold text-[#0F172A] leading-tight">
                  Stylish &amp;<br />Comfortable
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="text-[#0F172A] mb-1.5 flex items-center justify-center h-7">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="4" rx="1" />
                    <path d="M12 8v13" />
                    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                  </svg>
                </div>
                <p className="text-[11px] lg:text-xs font-bold text-[#0F172A] leading-tight">
                  Perfect<br />for Gifting
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
