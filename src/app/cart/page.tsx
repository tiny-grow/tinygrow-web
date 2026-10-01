import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartView from '@/components/CartView';
import { getContactInformation, getSocialLinks } from '@/lib/supabase/queries';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Bag & Cart | TinyGrow',
  description: 'Review your selected baby clothes, toys, and essentials and place your order directly via WhatsApp.',
};

export const revalidate = 0;

export default async function CartPage() {
  const [contactInfo, socialLinks] = await Promise.all([
    getContactInformation(),
    getSocialLinks(),
  ]);

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />
      <main className="flex-1 w-full bg-white">
        <CartView contact={contactInfo} />
      </main>
      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
