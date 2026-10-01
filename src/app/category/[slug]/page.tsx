import { Suspense } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import DressesCatalog from '@/components/DressesCatalog';
import {
  getCategories,
  getProducts,
  getContactInformation,
  getSocialLinks,
} from '@/lib/supabase/queries';
import { searchAndRankProducts } from '@/lib/searchUtils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams?.q?.trim().toLowerCase() || '';

  const isDressPage = slug === 'dresses' || slug === 'clothing';
  const [categories, rawProducts, contactInfo, socialLinks] = await Promise.all([
    getCategories(),
    getProducts(isDressPage ? { isDress: true } : { categorySlug: slug }),
    getContactInformation(),
    getSocialLinks(),
  ]);

  let allProducts = rawProducts;
  if (query) {
    allProducts = searchAndRankProducts(allProducts, query);
  }

  if (slug === 'dresses') {
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

  const currentCategory = categories.find((c) => c.slug === slug);
  const title = currentCategory?.name || (slug.charAt(0).toUpperCase() + slug.slice(1));
  const description = currentCategory?.description || `Explore our curated ${title.toLowerCase()} collection.`;

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full px-4 sm:px-10 lg:px-12 py-6 sm:py-8 bg-white min-h-[600px]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back Link */}
          <div className="mb-4 sm:mb-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FB7185] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shop</span>
            </Link>
          </div>

          {/* Category Header */}
          <div className="border-b border-slate-100 pb-5 sm:pb-6 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-xl">
              {description}
            </p>
          </div>

          {/* Products Grid */}
          {allProducts && allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch">
              {allProducts.map((product) => (
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
                No products available yet in {title}.
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                New inventory added to this category in the Admin panel will appear here immediately.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block text-xs font-bold text-[#0284C7] hover:underline"
              >
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
