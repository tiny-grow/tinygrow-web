import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContactInformation, getSocialLinks } from '@/lib/supabase/queries';
import { Metadata } from 'next';
import Link from 'next/link';
import { Ruler, Sparkles, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Baby Size Guide | TinyGrow',
  description: 'Detailed size and measurement charts for baby onesies, frocks, sleepsuits, and booties to find the perfect fit.',
};

export const revalidate = 0;

export default async function SizeGuidePage() {
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-3">
              <Ruler className="w-3.5 h-3.5" />
              <span>Fitting &amp; Sizing</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Baby Size &amp; Measurement Guide
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every baby grows at their own unique pace! Use our weight, height, and age benchmarks below to find the most comfortable fit.
            </p>
          </div>

          {/* Quick Tip Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 border border-pink-100 flex items-start gap-3.5 mb-10 text-xs sm:text-sm text-slate-700">
            <Sparkles className="w-5 h-5 text-[#FB7185] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-0.5">Helpful Parent Tip:</strong>
              If your baby’s measurements fall between two sizes or on the higher end of a weight bracket, we always recommend choosing the <strong>larger size</strong> to allow room for diaper bulk and rapid baby growth.
            </div>
          </div>

          {/* Table 1: Baby Clothing (Onesies, Rompers & Outfits) */}
          <div className="mb-10">
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" />
              Baby Clothing (Onesies, Rompers &amp; Outfits)
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm min-w-[460px]">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 sm:p-3.5">Size / Age Tag</th>
                    <th className="p-3 sm:p-3.5">Baby Weight</th>
                    <th className="p-3 sm:p-3.5">Baby Height</th>
                    <th className="p-3 sm:p-3.5">Chest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-pink-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">Newborn (NB)</td>
                    <td className="p-3 sm:p-3.5">2.5 – 3.8 kg</td>
                    <td className="p-3 sm:p-3.5">Up to 50 cm</td>
                    <td className="p-3 sm:p-3.5">38 cm / 15 in</td>
                  </tr>
                  <tr className="hover:bg-pink-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">0 – 3 Months</td>
                    <td className="p-3 sm:p-3.5">3.8 – 5.5 kg</td>
                    <td className="p-3 sm:p-3.5">50 – 60 cm</td>
                    <td className="p-3 sm:p-3.5">41 cm / 16 in</td>
                  </tr>
                  <tr className="hover:bg-pink-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">3 – 6 Months</td>
                    <td className="p-3 sm:p-3.5">5.5 – 7.5 kg</td>
                    <td className="p-3 sm:p-3.5">60 – 68 cm</td>
                    <td className="p-3 sm:p-3.5">44 cm / 17 in</td>
                  </tr>
                  <tr className="hover:bg-pink-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">6 – 12 Months</td>
                    <td className="p-3 sm:p-3.5">7.5 – 10.0 kg</td>
                    <td className="p-3 sm:p-3.5">68 – 76 cm</td>
                    <td className="p-3 sm:p-3.5">47 cm / 18.5 in</td>
                  </tr>
                  <tr className="hover:bg-pink-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">1 – 2 Years</td>
                    <td className="p-3 sm:p-3.5">10.0 – 12.5 kg</td>
                    <td className="p-3 sm:p-3.5">76 – 86 cm</td>
                    <td className="p-3 sm:p-3.5">50 cm / 19.5 in</td>
                  </tr>
                  <tr className="hover:bg-pink-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">2 – 3 Years</td>
                    <td className="p-3 sm:p-3.5">12.5 – 15.0 kg</td>
                    <td className="p-3 sm:p-3.5">86 – 96 cm</td>
                    <td className="p-3 sm:p-3.5">53 cm / 21 in</td>
                  </tr>
                  <tr className="hover:bg-pink-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">3 – 4 Years</td>
                    <td className="p-3 sm:p-3.5">15.0 – 18.0 kg</td>
                    <td className="p-3 sm:p-3.5">96 – 104 cm</td>
                    <td className="p-3 sm:p-3.5">56 cm / 22 in</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Baby Booties, Socks & Caps */}
          <div className="mb-10">
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
              Baby Booties, Socks &amp; Beanie Caps
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm min-w-[460px]">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 sm:p-3.5">Age Group</th>
                    <th className="p-3 sm:p-3.5">Bootie Insole Length</th>
                    <th className="p-3 sm:p-3.5">Cap Head Circumference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-sky-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">0 – 3 Months</td>
                    <td className="p-3 sm:p-3.5">9.0 – 10.0 cm</td>
                    <td className="p-3 sm:p-3.5">34 – 38 cm</td>
                  </tr>
                  <tr className="hover:bg-sky-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">3 – 6 Months</td>
                    <td className="p-3 sm:p-3.5">10.0 – 11.0 cm</td>
                    <td className="p-3 sm:p-3.5">38 – 42 cm</td>
                  </tr>
                  <tr className="hover:bg-sky-50/20">
                    <td className="p-3 sm:p-3.5 font-bold text-slate-900">6 – 12 Months</td>
                    <td className="p-3 sm:p-3.5">11.0 – 12.5 cm</td>
                    <td className="p-3 sm:p-3.5">42 – 46 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sizing Assistance CTA */}
          <div className="p-6 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Unsure which size is right?</h2>
              <p className="text-xs text-slate-600">Send your baby’s age and weight to our WhatsApp team for an instant recommendation!</p>
            </div>
            <a
              href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hi%20TinyGrow%2C%20could%20you%20help%20me%20choose%20the%20right%20size%20for%20my%20baby%3F`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-md transition-all whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Get Sizing Help</span>
            </a>
          </div>
        </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
