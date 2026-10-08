import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/supabase/types';
import ProductCard from './ProductCard';

interface NewArrivalsProps {
  products: Product[];
  whatsappNumber?: string | null;
}

export default function NewArrivals({ products, whatsappNumber }: NewArrivalsProps) {
  return (
    <section className="px-4 sm:px-10 lg:px-12 py-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <Link href="/new-arrivals" className="group">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight group-hover:text-[#FB7185] transition-colors">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Handpicked favourites for your little ones
            </p>
          </Link>

          <Link
            href="/new-arrivals"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* Product Grid / Empty State */}
        {products && products.length > 0 ? (
          <>
            {/* Mobile: 2-col grid showing bigger cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:hidden">
              {products.slice(0, 6).map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={whatsappNumber}
                  hideWishlist={true}
                  priority={idx < 4}
                />
              ))}
            </div>
            {/* sm+: original 4-5 col grid showing 5 products */}
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {products.slice(0, 5).map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={whatsappNumber}
                  hideWishlist={true}
                  priority={idx < 4}
                />
              ))}
            </div>
          </>

        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-[#FAF9F7] p-10 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No products available yet.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add new arrivals in the admin panel to display them here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
