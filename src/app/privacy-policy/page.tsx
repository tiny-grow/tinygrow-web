import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContactInformation, getSocialLinks } from '@/lib/supabase/queries';
import { Metadata } from 'next';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | TinyGrow - Little Moments, Made to Grow',
  description:
    'Read TinyGrow privacy policy. We prioritize protecting the personal information and privacy of parents and children when shopping for baby clothing and toys.',
  keywords: [
    'TinyGrow privacy policy',
    'baby store privacy',
    'data protection',
    'safe baby shopping',
  ],
};

export const revalidate = 0;

export default async function PrivacyPolicyPage() {
  const [contactInfo, socialLinks] = await Promise.all([
    getContactInformation(),
    getSocialLinks(),
  ]);

  const cleanPhone =
    contactInfo?.whatsapp_number?.replace(/\D/g, '') || '917994702567';
  const email = contactInfo?.email || 'care@tinygrow.com';

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full bg-slate-50/50 py-10 sm:py-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-100 shadow-xs">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0284C7] text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Customer Protection</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              At TinyGrow, protecting the trust and privacy of families is our highest responsibility.
              This policy explains how we treat your information with utmost care.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex flex-col items-center text-center">
              <Lock className="w-6 h-6 text-[#0284C7] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">Encrypted Data</h2>
              <p className="text-xs text-slate-600">All transmissions and order data are strictly secured.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-pink-100 flex flex-col items-center text-center">
              <Eye className="w-6 h-6 text-[#FB7185] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">Zero Data Selling</h2>
              <p className="text-xs text-slate-600">We never sell, trade, or rent your personal info to third parties.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex flex-col items-center text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">Direct Communication</h2>
              <p className="text-xs text-slate-600">Order updates sent exclusively via WhatsApp or Email.</p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100 pt-8">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                1. Information We Collect
              </h2>
              <p className="mb-2">When you place an order or interact with our storefront, we may collect:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li><strong>Contact details:</strong> Name, phone / WhatsApp number, and delivery address to fulfill orders.</li>
                <li><strong>Order preferences:</strong> Age groups, product choices, and sizing requirements.</li>
                <li><strong>Anonymous analytics:</strong> Standard browser and device data to optimize website speed and performance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>To confirm and process your WhatsApp orders and package delivery.</li>
                <li>To coordinate returns, size exchanges, and address customer care queries.</li>
                <li>To inform you of seasonal collections and exclusive offers (only with your permission).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                3. WhatsApp Ordering Privacy
              </h2>
              <p>
                When you initiate an order through WhatsApp Click-to-Chat, conversations take place inside WhatsApp’s secure, end-to-end encrypted messaging environment. We retain only necessary shipping details to fulfill your delivery.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                4. Cookies &amp; Local Storage
              </h2>
              <p>
                We use browser local storage solely to retain your active shopping bag items across sessions so you don’t lose your selections while browsing. No tracking cookies are sold to advertising brokers.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                5. Contacting Our Privacy Officer
              </h2>
              <p>
                If you have questions about your personal data or wish to have your contact details updated or removed from our delivery system, please contact our support desk at{' '}
                <a href={`mailto:${email}`} className="text-[#0284C7] font-semibold hover:underline">
                  {email}
                </a>{' '}
                or message us directly on WhatsApp.
              </p>
            </section>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-pink-50 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Questions about your data or privacy?</h2>
              <p className="text-xs text-slate-600">Our team is happy to assist you anytime.</p>
            </div>
            <a
              href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hi%20TinyGrow%2C%20I%20have%20a%20question%20regarding%20Privacy%20Policy.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-md transition-all whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with Support</span>
            </a>
          </div>
        </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
