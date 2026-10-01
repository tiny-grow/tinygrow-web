'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/supabase/types';

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string | null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl border border-slate-100/90 p-2 sm:p-3 hover:shadow-md hover:border-pink-100 transition-all duration-200">
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#FAF5F2] rounded-xl overflow-hidden mb-2">
        {product.image_url ? (
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        ) : (
          <Link
            href={`/product/${product.slug}`}
            className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-3 text-center"
          >
            <span className="text-2xl mb-1">🧸</span>
            <span className="text-xs font-medium text-slate-500">{product.name}</span>
          </Link>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-500 hover:text-[#FB7185] shadow-xs transition-colors"
          aria-label="Save to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isWishlisted
                ? 'fill-[#FB7185] text-[#FB7185]'
                : 'text-slate-500 hover:text-[#FB7185]'
            }`}
          />
        </button>
      </div>

      {/* Product Details - Perfectly aligned */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <Link
            href={`/product/${product.slug}`}
            className="font-semibold text-xs sm:text-sm text-[#1E293B] hover:text-[#FB7185] transition-colors line-clamp-2 min-h-[32px] sm:min-h-[38px] leading-snug block"
            title={product.name}
          >
            {product.name}
          </Link>
          <div className="text-xs sm:text-sm font-bold text-[#0F172A] mt-1">
            ₹{Number(product.price).toLocaleString()}
          </div>
        </div>

        {/* View Details Button */}
        <Link
          href={`/product/${product.slug}`}
          className="mt-2.5 w-full py-1.5 px-2 bg-slate-50 hover:bg-[#FB7185] text-[#334155] hover:text-white text-[11px] sm:text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 border border-slate-200/80 hover:border-[#FB7185] group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
