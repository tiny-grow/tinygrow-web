import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContactInformation, getSocialLinks, getAboutSection } from '@/lib/supabase/queries';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, ShieldCheck, Leaf, ArrowRight, Smile } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | TinyGrow - Little Moments, Made to Grow',
  description: 'Learn about TinyGrow, our gentle organic baby garments, safe playful toys, and passion for newborn comfort.',
};

export const revalidate = 0;

export default async function AboutPage() {
  const [contactInfo, socialLinks, aboutSection] = await Promise.all([
    getContactInformation(),
    getSocialLinks(),
    getAboutSection(),
  ]);

  const heroImage =
    aboutSection?.image_url ||
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full bg-white">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-8 lg:px-12 py-12 sm:py-16 bg-[#FFFBF7] border-b border-orange-100/60 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 text-[#FB7185] text-xs font-bold mb-4">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Our Story &amp; Values</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-4">
                Crafted for gentle smiles and big growing moments.
              </h1>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl mb-6">
                TinyGrow was born out of a simple, beautiful wish: to provide infants with clothing and toys as gentle, pure, and safe as a mother’s touch. Every thread is selected with love, comfort, and sustainable care.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-full shadow-md shadow-pink-200 transition-all active:scale-[0.98]"
                >
                  <span>Explore Our Collection</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <Link
                  href="/size-guide"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm py-3 px-6 rounded-full border border-slate-200 transition-all"
                >
                  <span>View Size Guide</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                <Image
                  src={heroImage}
                  alt="TinyGrow Baby Care"
                  fill
                  unoptimized
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3 Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              Why Parents Trust TinyGrow
            </h2>
            <p className="text-sm text-slate-600">
              We hold every piece to the highest pediatric safety and comfort standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-3xl bg-pink-50/50 border border-pink-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#FB7185] flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">100% Organic &amp; Pure</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Breathable, chemical-free organic cotton dyed with water-based non-toxic inks safe for newborn skin and tender gums.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-sky-50/50 border border-sky-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284C7] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Baby-Safe Craftsmanship</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Flat-lock seams, tagless labels, and nickel-free snaps ensure zero scratchiness or irritation during naptime or crawling.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Made for Joyful Play</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Easy diaper snap closures, stretchable expandable necklines, and durable fibers that stay soft wash after wash.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
