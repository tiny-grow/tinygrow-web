import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContactInformation, getSocialLinks } from '@/lib/supabase/queries';
import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, MessageCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Exchanges Policy | TinyGrow',
  description: 'Learn about TinyGrow 7-day hassle-free returns and exchanges for organic baby clothing and essentials.',
};

export const revalidate = 0;

export default async function ReturnsExchangesPage() {
  const [contactInfo, socialLinks] = await Promise.all([
    getContactInformation(),
    getSocialLinks(),
  ]);

  const cleanPhone =
    contactInfo?.whatsapp_number?.replace(/\D/g, '') || '917994702567';

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full bg-slate-50/50 py-10 sm:py-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-100 shadow-sm">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 text-[#FB7185] text-xs font-bold mb-3">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Customer Care</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Returns &amp; Exchanges Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We want you and your little one to be 100% delighted with every TinyGrow purchase.
              Enjoy our gentle, hassle-free 7-day return window.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-pink-100 flex flex-col items-center text-center">
              <Clock className="w-6 h-6 text-[#FB7185] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">7-Day Window</h2>
              <p className="text-xs text-slate-600">Request return or exchange within 7 days of delivery.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex flex-col items-center text-center">
              <ShieldCheck className="w-6 h-6 text-[#0284C7] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">Doorstep Pickup</h2>
              <p className="text-xs text-slate-600">We arrange reverse pickup right from your home address.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex flex-col items-center text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">Instant Refund</h2>
              <p className="text-xs text-slate-600">Refunds credited directly via UPI or your original method.</p>
            </div>
          </div>

          {/* Policy Details */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100 pt-8">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                1. Eligibility for Returns &amp; Exchanges
              </h2>
              <p className="mb-2">To qualify for a return or size exchange, products must meet the following criteria:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>Items must be unworn, unwashed, and undamaged with all original tags attached.</li>
                <li>Products must remain in their original baby-safe packaging.</li>
                <li>Request must be raised within 7 calendar days of receipt.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                2. How to Initiate a Return or Exchange
              </h2>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                <p className="font-semibold text-slate-900">Follow these 3 easy steps:</p>
                <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-sm">
                  <li>
                    <strong>Message our WhatsApp Team:</strong> Send a quick WhatsApp to{' '}
                    <a
                      href={`https://api.whatsapp.com/send?phone=${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-bold hover:underline"
                    >
                      {contactInfo?.whatsapp_number || '+91 79947 02567'}
                    </a>{' '}
                    with your Order ID/Receipt and photo of the item.
                  </li>
                  <li>
                    <strong>Reverse Pickup:</strong> Our delivery partner will pick up the package from your doorstep within 24–48 hours.
                  </li>
                  <li>
                    <strong>Exchange or Refund:</strong> Once inspected, we will dispatch your replacement size or issue a full refund within 24 hours.
                  </li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                3. Damaged or Incorrect Items
              </h2>
              <p>
                In the rare event that an item arrives defective, damaged, or incorrect, please notify us within 48 hours of delivery.
                We will send an immediate free replacement with express shipping at zero extra cost.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                4. Non-Returnable Hygiene Items
              </h2>
              <div className="flex items-start gap-3 p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-amber-900 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  For the strict health and hygiene of all infants, opened baby silicone teethers, pacifiers, and worn booties with broken seals cannot be returned once unsealed, unless defective.
                </p>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 border border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Have a question about a return?</h2>
              <p className="text-xs text-slate-600">Our customer care team is available on WhatsApp Mon–Sat.</p>
            </div>
            <a
              href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hi%20TinyGrow%2C%20I%20have%20a%20question%20about%20Returns%20and%20Exchanges.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-md transition-all whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with Customer Care</span>
            </a>
          </div>
        </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
