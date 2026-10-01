import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import {
  getProducts,
  getContactInformation,
  getSocialLinks,
} from '@/lib/supabase/queries';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function NewArrivalsPage() {
  const [allProducts, contactInfo, socialLinks] = await Promise.all([
    getProducts({ limit: 48 }),
    getContactInformation(),
    getSocialLinks(),
  ]);

  // Priority to items tagged is_new_arrival, or all products ordered by latest
  const newArrivals =
    allProducts.filter((p) => p.is_new_arrival).length > 0
      ? allProducts.filter((p) => p.is_new_arrival)
      : allProducts;

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full px-4 sm:px-10 lg:px-12 py-6 sm:py-8 bg-white min-h-[600px]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back Link */}
          <div className="mb-4 sm:mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FB7185] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="border-b border-slate-100 pb-5 sm:pb-6 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-[#FB7185] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FRESH ARRIVALS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                New Arrivals
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-xl">
                Explore our freshest collection of baby dresses, cozy sets, and adorable essentials.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Showing {newArrivals.length} {newArrivals.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Products Grid */}
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={contactInfo?.whatsapp_number}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-[#FAF9F7] p-12 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No new arrival products found yet.
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Items marked as New Arrival in the Admin panel will appear here immediately.
              </p>
              <Link
                href="/category/dresses"
                className="mt-4 inline-block text-xs font-bold text-[#FB7185] hover:underline"
              >
                Explore all dresses
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
