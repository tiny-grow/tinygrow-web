import { Suspense } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DressesCatalog from '@/components/DressesCatalog';
import {
  getProducts,
  getContactInformation,
  getSocialLinks,
} from '@/lib/supabase/queries';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Baby Dresses & Frocks | Organic Cotton Babywear',
  description:
    'Shop ultra-soft, breathable baby dresses, pastel frocks, and newborn onesies made with 100% certified organic cotton at TinyGrow.',
  keywords: [
    'baby dresses online',
    'baby frocks India',
    'organic baby clothes',
    'cotton onesies for newborn',
    'infant party dresses',
  ],
};

export const revalidate = 0;

export default async function DressesPage() {
  const [allProducts, contactInfo, socialLinks] = await Promise.all([
    getProducts({ isDress: true }),
    getContactInformation(),
    getSocialLinks(),
  ]);

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />
      <main className="flex-1 w-full bg-white">
        <Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading dresses...</div>}>
          <DressesCatalog initialProducts={allProducts} contact={contactInfo} />
        </Suspense>
      </main>
      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
