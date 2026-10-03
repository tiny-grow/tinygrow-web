'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  MessageCircle,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { InstagramIcon, FacebookIcon, PinterestIcon, YoutubeIcon, WhatsAppIcon } from './SocialIcons';
import { ContactInformation, SocialLink } from '@/lib/supabase/types';

interface FooterProps {
  contact?: ContactInformation | null;
  socials?: SocialLink[];
}

export default function Footer({ contact, socials = [] }: FooterProps) {
  // Mobile accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: false,
    care: false,
    info: false,
    contact: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const phone =
    contact?.phone && !contact.phone.includes('98765')
      ? contact.phone
      : '+91 79947 02567';
  const whatsappNumber =
    contact?.whatsapp_number && !contact.whatsapp_number.includes('98765')
      ? contact.whatsapp_number
      : '917994702567';
  const cleanPhone = whatsappNumber.replace(/\D/g, '') || '917994702567';
  const email = contact?.email || 'support@tinygrow.com';
  const hours = contact?.business_hours || 'Mon - Sat, 9:00 AM - 7:00 PM';
  const address = contact?.address || '123 Joyful Lane, Blossom Garden, City - 400001';

  const instagramLink = socials.find((s) => s.platform?.toLowerCase() === 'instagram')?.url || 'https://instagram.com';
  const facebookLink = socials.find((s) => s.platform?.toLowerCase() === 'facebook')?.url || 'https://facebook.com';
  const pinterestLink = socials.find((s) => s.platform?.toLowerCase() === 'pinterest')?.url || 'https://pinterest.com';
  const youtubeLink = socials.find((s) => s.platform?.toLowerCase() === 'youtube')?.url || 'https://youtube.com';
  const whatsappLink = `https://api.whatsapp.com/send?phone=${cleanPhone}`;

  return (
    <footer className="w-full bg-gradient-to-b from-[#F4F9FD] to-[#EAF4FB] text-[#334155] border-t border-[#D6E8F6]">
      {/* ── Top Trust Badges Bar ── */}
      <div className="border-b border-[#D6E8F6] bg-white/50 backdrop-blur-xs py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 p-2">
            <div className="w-10 h-10 rounded-2xl bg-pink-100/70 text-[#FB7185] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">100% Baby Safe</h3>
              <p className="text-[11px] text-[#64748B]">Certified organic cotton</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 p-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100/70 text-[#0284C7] flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">Free Delivery</h3>
              <p className="text-[11px] text-[#64748B]">Across all orders in India</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 p-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">7-Day Easy Returns</h3>
              <p className="text-[11px] text-[#64748B]">Doorstep reverse pickup</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 p-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-[#25D366] flex items-center justify-center shrink-0 shadow-2xs">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">WhatsApp Ordering</h3>
              <p className="text-[11px] text-[#64748B]">Instant confirmation</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Links Grid ── */}
      <div className="max-w-7xl mx-auto pt-10 sm:pt-14 pb-10 px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 items-start">
          {/* Col 1: Brand Info & Socials (span 2 on lg) */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 flex flex-col gap-4">
            <BrandLogo />
            <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed max-w-sm mt-1">
              Thoughtfully curated organic baby garments, cheerful developmental toys, and gentle accessories tailored with love for every growing milestone.
            </p>

            {/* Social Icons */}
            <div className="mt-2">
              <span className="text-[11px] font-bold text-[#0F2942] uppercase tracking-wider block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-[#D0E4F5] flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-2xs hover:scale-105"
                  aria-label="WhatsApp"
                  title="Chat on WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-[#D0E4F5] flex items-center justify-center text-[#1E293B] hover:text-[#FB7185] hover:border-[#FB7185] transition-all shadow-2xs hover:scale-105"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-[#D0E4F5] flex items-center justify-center text-[#1E293B] hover:text-[#0284C7] hover:border-[#0284C7] transition-all shadow-2xs hover:scale-105"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a
                  href={pinterestLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-[#D0E4F5] flex items-center justify-center text-[#1E293B] hover:text-rose-500 hover:border-rose-300 transition-all shadow-2xs hover:scale-105"
                  aria-label="Pinterest"
                >
                  <PinterestIcon className="w-4 h-4" />
                </a>
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-[#D0E4F5] flex items-center justify-center text-[#1E293B] hover:text-red-600 hover:border-red-300 transition-all shadow-2xs hover:scale-105"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Collections */}
          <div className="border-b border-[#D6E8F6] pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('shop')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0 cursor-pointer"
              aria-expanded={openSections.shop}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Shop</h4>
                <div className="w-6 h-0.5 bg-[#FB7185] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 sm:hidden transition-transform duration-200 ${
                  openSections.shop ? 'rotate-180 text-[#FB7185]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-4 ${openSections.shop ? 'block' : 'hidden sm:block'}`}>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#475569]">
                <li>
                  <Link href="/category/dresses" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    Baby Dresses &amp; Frocks
                  </Link>
                </li>
                <li>
                  <Link href="/category/accessories" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    Accessories &amp; Booties
                  </Link>
                </li>
                <li>
                  <Link href="/category/toys" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    Montessori &amp; Soft Toys
                  </Link>
                </li>
                <li>
                  <Link href="/new-arrivals" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/shop?filter=offers" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    Special Offers
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Customer Care */}
          <div className="border-b border-[#D6E8F6] pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('care')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0 cursor-pointer"
              aria-expanded={openSections.care}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Customer Care</h4>
                <div className="w-6 h-0.5 bg-[#38BDF8] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 sm:hidden transition-transform duration-200 ${
                  openSections.care ? 'rotate-180 text-[#38BDF8]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-4 ${openSections.care ? 'block' : 'hidden sm:block'}`}>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#475569]">
                <li>
                  <Link href="/returns-exchanges" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    Returns &amp; Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    FAQs &amp; Help
                  </Link>
                </li>
                <li>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#25D366] font-semibold transition-colors inline-flex items-center gap-1.5 hover:translate-x-1 duration-200 text-[#16A34A]"
                  >
                    <span>WhatsApp Support</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Information */}
          <div className="border-b border-[#D6E8F6] pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('info')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0 cursor-pointer"
              aria-expanded={openSections.info}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Information</h4>
                <div className="w-6 h-0.5 bg-[#34D399] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 sm:hidden transition-transform duration-200 ${
                  openSections.info ? 'rotate-180 text-[#34D399]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-4 ${openSections.info ? 'block' : 'hidden sm:block'}`}>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#475569]">
                <li>
                  <Link href="/about" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    About TinyGrow
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    Baby Size Guide
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    Shopping Bag
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 5: Contact Information */}
          <div className="border-b border-[#D6E8F6] pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0 cursor-pointer"
              aria-expanded={openSections.contact}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Contact</h4>
                <div className="w-6 h-0.5 bg-[#818CF8] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 sm:hidden transition-transform duration-200 ${
                  openSections.contact ? 'rotate-180 text-[#818CF8]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-4 ${openSections.contact ? 'block' : 'hidden sm:block'}`}>
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#475569]">
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="font-bold text-[#0F172A] hover:text-[#0284C7] transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{phone}</span>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="text-xs text-[#475569] hover:text-[#0284C7] transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{email}</span>
                </a>
                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{hours}</span>
                </div>
                {address && (
                  <div className="flex items-start gap-2 text-[11px] text-[#64748B] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>{address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar: Copyright, Tagline & Crafted By ── */}
        <div className="pt-8 mt-8 border-t border-[#D6E8F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} TinyGrow. Little Moments, Made to Grow.</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end text-xs text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span>Made with love for happy little smiles</span>
              <Heart className="w-3.5 h-3.5 fill-[#FB7185] text-[#FB7185]" />
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <a
              href="https://www.ekodrix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#64748B] hover:text-[#0284C7] transition-colors inline-flex items-center gap-1 group"
              title="Visit Ekodrix"
            >
              <span>Crafted by</span>
              <span className="font-bold text-[#0F172A] group-hover:text-[#0284C7] underline decoration-slate-300 hover:decoration-[#0284C7] underline-offset-2 transition-colors">
                ekodrix
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
