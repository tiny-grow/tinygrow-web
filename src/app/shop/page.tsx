import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import {
  getCategories,
  getProducts,
  getContactInformation,
  getSocialLinks,
} from '@/lib/supabase/queries';
import { searchAndRankProducts } from '@/lib/searchUtils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { X, Search } from 'lucide-react';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    category?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const rawQuery = resolvedParams.q || '';
  const query = rawQuery.trim().toLowerCase();
  const filter = resolvedParams.filter || '';
  const selectedCategory = resolvedParams.category || '';

  if (filter === 'new') {
    redirect('/new-arrivals');
  }

  const [categories, allProducts, contactInfo, socialLinks] = await Promise.all([
    getCategories(),
    getProducts(),
    getContactInformation(),
    getSocialLinks(),
  ]);

  // Apply filters
  let filteredProducts = allProducts;

  // Apply fuzzy spelling-tolerant search
  if (query) {
    filteredProducts = searchAndRankProducts(filteredProducts, query);
  }

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => (p.categories as any)?.slug === selectedCategory || (p as any).category_id === selectedCategory
    );
  }

  if (filter === 'new') {
    filteredProducts = filteredProducts.filter((p) => p.is_new_arrival);
  } else if (filter === 'dresses') {
    filteredProducts = filteredProducts.filter((p) => !p.is_toy && !p.is_accessory);
  } else if (filter === 'toys') {
    filteredProducts = filteredProducts.filter((p) => p.is_toy);
  } else if (filter === 'accessories') {
    filteredProducts = filteredProducts.filter((p) => p.is_accessory);
  } else if (filter === 'offers') {
    filteredProducts = filteredProducts.filter((p) => p.featured);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full px-4 sm:px-10 lg:px-12 py-6 sm:py-8 bg-white min-h-[600px]">
        <div className="max-w-7xl mx-auto">
            {/* Header & Filter Breadcrumb */}
            <div className="border-b border-slate-100 pb-5 sm:pb-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                      {filter === 'new'
                        ? 'New Arrivals'
                        : filter === 'dresses'
                        ? 'Baby Dresses'
                        : filter === 'toys'
                        ? 'Baby Toys'
                        : filter === 'accessories'
                        ? 'Baby Accessories'
                        : filter === 'offers'
                        ? 'Special Offers'
                        : rawQuery
                        ? `Search: "${rawQuery}"`
                        : 'All Products'}
                    </h1>
                    {rawQuery && (
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-pink-50 text-[#FB7185] hover:bg-pink-100 px-2.5 py-1 rounded-full transition-colors ml-1"
                        title="Clear search"
                      >
                        <span>Clear</span>
                        <X className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 max-w-full -mx-1 px-1 scrollbar-none">
                  <Link
                    href="/shop"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      !selectedCategory && !filter
                        ? 'bg-[#FB7185] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </Link>
                  <Link
                    href="/category/dresses"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Dresses
                  </Link>
                  <Link
                    href="/shop?filter=accessories"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      filter === 'accessories'
                        ? 'bg-[#FB7185] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Accessories
                  </Link>
                  <Link
                    href="/shop?filter=toys"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      filter === 'toys'
                        ? 'bg-[#FB7185] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Toys
                  </Link>
                  {categories
                    .filter((cat) => {
                      const name = (cat.name || '').toLowerCase();
                      const slug = (cat.slug || '').toLowerCase();
                      if (name.includes('accessor') || slug.includes('accessor')) return false;
                      if (name.includes('toy') || slug.includes('toy')) return false;
                      if (name.includes('dress') || slug.includes('dress') || slug === 'clothing' || name.includes('traditional')) return false;
                      return true;
                    })
                    .map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                          selectedCategory === cat.slug
                            ? 'bg-[#FB7185] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch">
                {filteredProducts.map((product) => (
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
                  No products available yet.
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  There are no products matching this criteria. Real products added via the Admin panel will display here.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block text-xs font-bold text-[#FB7185] hover:underline"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
