'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Truck,
  Leaf,
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';
import { Product, ContactInformation } from '@/lib/supabase/types';
import { matchesSearchSpelling } from '@/lib/searchUtils';

interface DressesCatalogProps {
  initialProducts?: Product[];
  contact?: ContactInformation | null;
}

const CATEGORIES = [
  { label: 'All Dresses', icon: ShoppingBag, bg: 'bg-[#FFF0F2]', border: 'border-[#FB7185]', iconColor: 'text-[#FB7185]' },
  { label: 'Casual Dresses', icon: Layers, bg: 'bg-[#F0F7FD]', border: 'border-sky-100', iconColor: 'text-sky-500' },
  { label: 'Party Wear', icon: Sparkles, bg: 'bg-[#FEF9E7]', border: 'border-amber-100', iconColor: 'text-amber-500' },
  { label: 'Romper Dresses', icon: Heart, bg: 'bg-[#EFFBF9]', border: 'border-teal-100', iconColor: 'text-teal-500' },
  { label: 'Traditional Wear', icon: Tag, bg: 'bg-[#FDEDEC]', border: 'border-rose-100', iconColor: 'text-rose-500' },
  { label: 'Frock Dresses', icon: ShoppingBag, bg: 'bg-[#FDF2F4]', border: 'border-pink-100', iconColor: 'text-pink-500' },
];

const SIZES = [
  '0 - 6 Months',
  '6 - 12 Months',
  '1 - 2 Years',
  '2 - 3 Years',
  '3 - 4 Years',
  '4 - 5 Years',
];

export default function DressesCatalog({ initialProducts = [], contact }: DressesCatalogProps) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>('All Dresses');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>(urlQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (urlQuery !== undefined) {
      setSearchQuery(urlQuery);
    }
  }, [urlQuery]);

  const whatsappPhone =
    contact?.whatsapp_number && !contact.whatsapp_number.includes('98765')
      ? contact.whatsapp_number
      : '+91 79947 02567';

  // Only use real products passed from the database! NO mock products!
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Search Query filter (with spelling & typo tolerance)
      if (searchQuery.trim()) {
        if (!matchesSearchSpelling(product, searchQuery)) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All Dresses') {
        const catName = product.categories?.name?.toLowerCase() || '';
        const selectedCat = selectedCategory.toLowerCase();
        const matchesCat =
          catName.includes(selectedCat.replace(' dresses', '')) ||
          catName === selectedCat ||
          product.name?.toLowerCase().includes(selectedCat.replace(' dresses', ''));
        if (!matchesCat) return false;
      }

      // 3. Size / Age filter
      if (selectedSizes.length > 0) {
        const productAges = product.suitable_ages || [];
        const matchesSize =
          productAges.length === 0 || // If not specified, keep accessible
          productAges.some((s) => selectedSizes.includes(s));
        if (!matchesSize) return false;
      }

      // 4. Price filter
      const price = Number(product.price) || 0;
      if (price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      // default: latest
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [initialProducts, searchQuery, selectedCategory, selectedSizes, maxPrice, sortBy]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => {
    setSelectedCategory('All Dresses');
    setSelectedSizes([]);
    setMaxPrice(2000);
    setSearchQuery('');
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* ── Breadcrumb ── */}
      <div className="mb-4 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-700">Dresses</span>
      </div>

      {/* Page Title & Count Header (Banner hidden as requested) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Dresses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Soft fabrics, charming patterns, and gentle daily comfort for little ones
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'dress' : 'dresses'}
        </span>
      </div>

      {/* ── Horizontal Category Style Pills Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left ${
                isActive
                  ? 'border-[#FB7185] bg-[#FFF0F2] ring-2 ring-pink-200/50 shadow-xs'
                  : `${cat.border} ${cat.bg} hover:border-slate-300`
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/70 shadow-2xs">
                <cat.icon className={`w-4 h-4 ${cat.iconColor}`} />
              </div>
              <span
                className={`text-xs font-bold leading-tight ${
                  isActive ? 'text-[#FB7185]' : 'text-slate-700'
                }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Two-Column Layout: Fixed Sidebar Filters + Product Catalog ── */}
      <div id="products-section" className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start mb-12 relative w-full">
        {/* Mobile Filter Toggle Button */}
        <div className="w-full lg:hidden mb-1">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FB7185]" />
              <span>Filter Dresses {selectedSizes.length > 0 ? `(${selectedSizes.length} active)` : ''}</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Left Sidebar Filters - Collapsible on Mobile, Sticky on Desktop */}
        <aside className={`w-full lg:w-[240px] shrink-0 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto ${mobileFiltersOpen ? 'block mb-4' : 'hidden lg:block'}`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-sm">
              <SlidersHorizontal className="w-4 h-4 text-[#FB7185]" />
              <span>Filters</span>
            </div>
            {(selectedCategory !== 'All Dresses' || selectedSizes.length > 0 || maxPrice < 2000 || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-semibold text-[#FB7185] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Section 1: Category */}
          <div className="mb-5">
            <h3 className="text-xs font-bold text-[#0F172A] mb-2.5">
              Category
            </h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => {
                const isChecked = selectedCategory === cat.label;
                return (
                  <label
                    key={cat.label}
                    className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none hover:text-[#FB7185] transition-colors"
                  >
                    <input
                      type="radio"
                      name="sidebarCategory"
                      checked={isChecked}
                      onChange={() => setSelectedCategory(cat.label)}
                      className="w-3.5 h-3.5 accent-[#FB7185] rounded cursor-pointer"
                    />
                    <span className={isChecked ? 'text-[#FB7185] font-bold' : ''}>
                      {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 2: Size */}
          <div className="mb-5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A] mb-2.5">
              Size
            </h3>
            <div className="flex flex-col gap-2">
              {SIZES.map((size) => {
                const isChecked = selectedSizes.includes(size);
                return (
                  <label
                    key={size}
                    className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none hover:text-[#FB7185] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSize(size)}
                      className="w-3.5 h-3.5 accent-[#FB7185] rounded cursor-pointer"
                    />
                    <span className={isChecked ? 'text-[#FB7185] font-bold' : ''}>
                      {size}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Price Range */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A] mb-2">
              Price Range
            </h3>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#FB7185] cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mt-2">
              <span>₹0</span>
              <span className="text-[#FB7185]">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <div className="flex-1 w-full">
          {/* Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {searchQuery && (
                <span className="text-slate-400 font-normal ml-1">
                  for &quot;{searchQuery}&quot;
                </span>
              )}
            </p>

            {/* Sort by Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-semibold text-slate-500">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-xs font-bold text-[#0F172A] rounded-xl py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#FB7185] cursor-pointer shadow-2xs"
                >
                  <option value="latest">Latest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Real Products Grid from Supabase (5 Columns on Desktop) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {filteredProducts.map((product) => {
                const isWish = !!wishlist[product.id];
                const priceNum = Number(product.price) || 0;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-slate-100 p-2.5 flex flex-col justify-between hover:shadow-md hover:border-pink-100 transition-all duration-300 h-full"
                  >
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#FAF9F7] mb-2.5">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-pink-300 bg-pink-50">
                          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                        </div>
                      )}

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-[#FB7185] transition-colors shadow-2xs"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isWish ? 'fill-[#FB7185] text-[#FB7185]' : 'stroke-[2]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug mb-1 line-clamp-2 min-h-[32px] sm:min-h-[38px] group-hover:text-[#FB7185] transition-colors" title={product.name}>
                          {product.name}
                        </h4>
                        <p className="text-xs sm:text-sm font-black text-[#0284C7] mb-2.5">
                          ₹{priceNum.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* View Details Link */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-[#FB7185] text-[#334155] hover:text-white font-semibold text-[11px] sm:text-xs py-2 px-2 rounded-xl border border-slate-200/80 hover:border-[#FB7185] shadow-2xs transition-all active:scale-[0.98] group/btn"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-[#FAF9F7] p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-[#FB7185] flex items-center justify-center mx-auto mb-3 text-xl">
                👗
              </div>
              <p className="text-sm font-bold text-slate-700">
                No dresses found matching your filters
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try selecting &apos;All Dresses&apos; or resetting your age and price range filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-5 py-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white rounded-full text-xs font-semibold shadow-xs transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Trust Badges Bar ── */}
      <div className="bg-[#FFF0F3] border border-pink-100/80 rounded-2xl py-4 sm:py-5 px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="flex items-center justify-center gap-2.5 text-slate-800">
          <Leaf className="w-5 h-5 text-[#FB7185] stroke-[1.8]" />
          <span className="text-xs sm:text-sm font-bold">Soft &amp; Safe Materials</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 text-slate-800">
          <ShieldCheck className="w-5 h-5 text-[#FB7185] stroke-[1.8]" />
          <span className="text-xs sm:text-sm font-bold">Gentle on Baby&apos;s Skin</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 text-slate-800">
          <Truck className="w-5 h-5 text-[#FB7185] stroke-[1.8]" />
          <span className="text-xs sm:text-sm font-bold">Fast &amp; Reliable Delivery</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 text-slate-800">
          <Heart className="w-5 h-5 text-[#FB7185] stroke-[1.8]" />
          <span className="text-xs sm:text-sm font-bold">Trusted by Parents</span>
        </div>
      </div>
    </div>
  </div>
  );
}
