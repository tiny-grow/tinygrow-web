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
