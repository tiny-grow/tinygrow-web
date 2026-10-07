import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContactInformation, getSocialLinks } from '@/lib/supabase/queries';
import { Metadata } from 'next';
import { Truck, PackageCheck, Clock, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | TinyGrow',
  description: 'Understand TinyGrow shipping rates, estimated delivery times across India, and baby-safe hygienic packaging.',
};

export const revalidate = 0;

export default async function ShippingPolicyPage() {
  const [contactInfo, socialLinks] = await Promise.all([
    getContactInformation(),
    getSocialLinks(),
  ]);

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full bg-slate-50/50 py-10 sm:py-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-100 shadow-sm">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0284C7] text-xs font-bold mb-3">
              <Truck className="w-3.5 h-3.5" />
              <span>Customer Care</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We know how exciting it is to receive baby essentials. Here is all you need to know about our fast, sanitized delivery across PAN India.
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex flex-col items-center text-center">
              <PackageCheck className="w-6 h-6 text-emerald-600 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">Delivery Across PAN India</h2>
              <p className="text-xs text-slate-600">On all orders anywhere across PAN India.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex flex-col items-center text-center">
              <Clock className="w-6 h-6 text-[#0284C7] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">2–4 Days Transit</h2>
              <p className="text-xs text-slate-600">Speedy delivery for metro and Tier-1 cities.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-pink-100 flex flex-col items-center text-center">
              <Sparkles className="w-6 h-6 text-[#FB7185] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 mb-1">Sanitized Pack</h2>
              <p className="text-xs text-slate-600">Hygienic, tamper-evident baby-safe packaging.</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100 pt-8">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                1. Delivery Across PAN India Rates
              </h2>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs sm:text-sm min-w-[420px]">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Order Type</th>
                      <th className="p-3">Shipping Charge</th>
                      <th className="p-3">Delivery Speed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">All Orders (India-wide)</td>
                      <td className="p-3 text-emerald-600 font-bold">FREE</td>
                      <td className="p-3 text-slate-600">Standard Express (2–5 Days)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                2. Estimated Delivery Timeframes
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  <strong>Metro Cities:</strong> 2 to 4 business days (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune).
                </li>
                <li>
                  <strong>Tier 2 &amp; Tier 3 Cities:</strong> 3 to 6 business days.
                </li>
                <li>
                  <strong>Remote &amp; North East Locations:</strong> 5 to 7 business days.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                3. Order Processing &amp; Dispatch
              </h2>
              <p>
                All orders are processed and carefully packed within <strong>24 business hours</strong> of WhatsApp order confirmation.
                Orders placed on Sundays or national holidays are dispatched on the next working day.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                4. Live Tracking via WhatsApp
              </h2>
              <p>
                As soon as your parcel is handed over to our verified courier partner (Bluedart, Delhivery, or Xpressbees),
                we send you an active live tracking link directly on WhatsApp, so you can watch your package make its way to your home.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
