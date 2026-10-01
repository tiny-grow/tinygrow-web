'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { InstagramIcon, FacebookIcon, PinterestIcon, YoutubeIcon, WhatsAppIcon } from './SocialIcons';
import { ContactInformation, SocialLink } from '@/lib/supabase/types';

interface FooterProps {
  contact?: ContactInformation | null;
  socials?: SocialLink[];
}

export default function Footer({ contact, socials = [] }: FooterProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: false,
    care: false,
    info: false,
    contact: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const phone = contact?.phone && !contact.phone.includes('98765')
    ? contact.phone
    : '+91 79947 02567';
  const whatsappNumber = contact?.whatsapp_number && !contact.whatsapp_number.includes('98765')
    ? contact.whatsapp_number
    : '917994702567';
  const cleanPhone = whatsappNumber.replace(/\D/g, '') || '917994702567';
  const hours = contact?.business_hours || 'Mon - Sat, 9:00 AM - 7:00 PM';

  const instagramLink = socials.find((s) => s.platform?.toLowerCase() === 'instagram')?.url || 'https://instagram.com';
  const facebookLink = socials.find((s) => s.platform?.toLowerCase() === 'facebook')?.url || 'https://facebook.com';
  const pinterestLink = socials.find((s) => s.platform?.toLowerCase() === 'pinterest')?.url || 'https://pinterest.com';
  const youtubeLink = socials.find((s) => s.platform?.toLowerCase() === 'youtube')?.url || 'https://youtube.com';
  const whatsappLink = `https://api.whatsapp.com/send?phone=${cleanPhone}`;

  return (
    <footer className="w-full bg-gradient-to-b from-[#F4F9FD] to-[#EAF4FB] text-[#334155] pt-12 sm:pt-14 pb-8 px-4 sm:px-10 lg:px-14 border-t border-[#D6E8F6]">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 items-start pb-12">
          {/* Col 1: Brand & Socials */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 flex flex-col gap-5">
            <div>
              <BrandLogo />
              <p className="text-sm text-[#475569] mt-3 font-medium leading-relaxed max-w-sm">
                Thoughtfully designed baby essentials, gentle fabrics, and adorable outfits crafted with love for every little milestone.
              </p>
            </div>

            {/* Social Media Links */}
            <div>
              <p className="text-xs font-bold text-[#0F2942] uppercase tracking-wider mb-2.5">
                Connect With Us
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-2xs hover:scale-105"
                  aria-label="WhatsApp"
                  title="Chat on WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#1E293B] hover:text-[#FB7185] hover:border-[#FB7185] transition-all shadow-2xs hover:scale-105"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#1E293B] hover:text-[#0284C7] hover:border-[#0284C7] transition-all shadow-2xs hover:scale-105"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a
                  href={pinterestLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#1E293B] hover:text-rose-500 hover:border-rose-300 transition-all shadow-2xs hover:scale-105"
                  aria-label="Pinterest"
                >
                  <PinterestIcon className="w-4 h-4" />
                </a>
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#1E293B] hover:text-red-600 hover:border-red-300 transition-all shadow-2xs hover:scale-105"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Collections */}
          <div className="border-b border-slate-200/60 pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('shop')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0"
              aria-expanded={openSections.shop}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Shop</h4>
                <div className="w-5 h-0.5 bg-[#FB7185] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 sm:hidden transition-transform duration-200 ${
                  openSections.shop ? 'rotate-180 text-[#FB7185]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-3.5 ${openSections.shop ? 'block' : 'hidden sm:block'}`}>
              <ul className="flex flex-col gap-2.5 text-sm text-[#475569]">
                <li>
                  <Link href="/category/dresses" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    Dresses
                  </Link>
                </li>
                <li>
                  <Link href="/category/accessories" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link href="/category/toys" className="hover:text-[#FB7185] transition-colors inline-block hover:translate-x-1 duration-200">
                    Baby Toys
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
          <div className="border-b border-slate-200/60 pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('care')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0"
              aria-expanded={openSections.care}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Customer Care</h4>
                <div className="w-5 h-0.5 bg-[#38BDF8] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 sm:hidden transition-transform duration-200 ${
                  openSections.care ? 'rotate-180 text-[#38BDF8]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-3.5 ${openSections.care ? 'block' : 'hidden sm:block'}`}>
              <ul className="flex flex-col gap-2.5 text-sm text-[#475569]">
                <li>
                  <Link href="/shop" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    Returns &amp; Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    FAQs
                  </Link>
                </li>
                <li>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] font-medium transition-colors inline-block hover:translate-x-1 duration-200">
                    WhatsApp Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Quick Links */}
          <div className="border-b border-slate-200/60 pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('info')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0"
              aria-expanded={openSections.info}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Information</h4>
                <div className="w-5 h-0.5 bg-[#34D399] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 sm:hidden transition-transform duration-200 ${
                  openSections.info ? 'rotate-180 text-[#34D399]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-3.5 ${openSections.info ? 'block' : 'hidden sm:block'}`}>
              <ul className="flex flex-col gap-2.5 text-sm text-[#475569]">
                <li>
                  <Link href="/" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    About TinyGrow
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#0284C7] transition-colors inline-block hover:translate-x-1 duration-200">
                    Size Guide
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 5: Contact as plain text */}
          <div className="border-b border-slate-200/60 pb-3 sm:pb-0 sm:border-none">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left py-1 sm:py-0"
              aria-expanded={openSections.contact}
            >
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Contact</h4>
                <div className="w-5 h-0.5 bg-[#818CF8] rounded-full mt-1.5 hidden sm:block" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 sm:hidden transition-transform duration-200 ${
                  openSections.contact ? 'rotate-180 text-[#818CF8]' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 sm:mt-3.5 ${openSections.contact ? 'block' : 'hidden sm:block'}`}>
              <div className="flex flex-col gap-2 text-sm text-[#475569]">
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="font-bold text-[#0F172A] text-sm hover:text-[#0284C7] transition-colors inline-block"
                >
                  {phone}
                </a>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {hours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Friendly Note (Card payment icons hidden as requested) */}
        <div className="pt-6 border-t border-[#D6E8F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span>&copy; {new Date().getFullYear()} TinyGrow. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span>Made with <span className="text-[#FB7185]">💕</span> for happy little ones</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
