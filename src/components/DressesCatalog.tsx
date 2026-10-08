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
import { getOptimizedImageUrl } from '@/lib/imageOptimization';

interface DressesCatalogProps {
  initialProducts?: Product[];
  contact?: ContactInformation | null;
}

const CAT_STYLE_PALETTE = [
  { bg: 'bg-[#FFF5F6]', border: 'border-pink-200/70', iconColor: 'text-pink-500', icon: ShoppingBag },
  { bg: 'bg-[#F0F7FD]', border: 'border-sky-100', iconColor: 'text-sky-500', icon: Layers },
  { bg: 'bg-[#FEF9E7]', border: 'border-amber-100', iconColor: 'text-amber-500', icon: Sparkles },
  { bg: 'bg-[#EFFBF9]', border: 'border-teal-100', iconColor: 'text-teal-500', icon: Heart },
  { bg: 'bg-[#FDEDEC]', border: 'border-rose-100', iconColor: 'text-rose-500', icon: Tag },
  { bg: 'bg-[#FDF2F4]', border: 'border-pink-100', iconColor: 'text-pink-500', icon: ShoppingBag },
  { bg: 'bg-[#F3F0FD]', border: 'border-violet-100', iconColor: 'text-violet-500', icon: Sparkles },
  { bg: 'bg-[#ECFDF5]', border: 'border-emerald-100', iconColor: 'text-emerald-500', icon: Leaf },
];

const AGE_GROUPS = [
  '0–3 Months',
  '3–6 Months',
  '6–12 Months',
  '1–2 Years',
  '2–3 Years',
  '3–4 Years',
  '4–5 Years',
];

function normalizeAge(str: string): string {
  return str
    .toLowerCase()
    .replace(/[–—−]/g, '-') // normalize en-dash, em-dash, minus to hyphen
    .replace(/\s*-\s*/g, '-') // remove whitespace around hyphen
    .replace(/\s+/g, '') // remove remaining spaces
    .trim();
}

function matchesAgeGroup(productAges: string[] | undefined, selectedAges: string[]): boolean {
  if (!selectedAges || selectedAges.length === 0) return true;
  if (!productAges || productAges.length === 0) return false;

  const normalizedProductAges = productAges.map(normalizeAge);

  return selectedAges.some((sel) => {
    const normSel = normalizeAge(sel);

    // Exact normalized match (e.g. '1-2years' === '1-2years')
    if (normalizedProductAges.includes(normSel)) return true;

    // Range-level compatibility
    if (normSel === '0-6months') {
      return (
        normalizedProductAges.includes('0-3months') ||
        normalizedProductAges.includes('3-6months')
      );
    }
    if ((normSel === '0-3months' || normSel === '3-6months') && normalizedProductAges.includes('0-6months')) {
      return true;
    }

    return false;
  });
}

const STANDARD_CATEGORIES = [
  'Casual Dresses',
  'Traditional Wear',
  'Party Wear',
  'Romper Dresses',
  'Frock Dresses',
];

export default function DressesCatalog({ initialProducts = [], contact }: DressesCatalogProps) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>('All Dresses');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const maxAvailablePrice = useMemo(() => {
    const prices = initialProducts.map((p) => Number(p.price) || 0);
    return Math.max(5000, ...prices);
  }, [initialProducts]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>(urlQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Build categories list for dresses (only dress types, no toys/accessories/baby dresses/duplicates)
  const allCategories = useMemo(() => {
    const seen = new Set<string>();
    const list: { label: string; style: typeof CAT_STYLE_PALETTE[0] }[] = [];

    // Predefined standard dress categories
    STANDARD_CATEGORIES.forEach((name) => {
      seen.add(name.toLowerCase());
      list.push({
        label: name,
        style: CAT_STYLE_PALETTE[list.length % CAT_STYLE_PALETTE.length],
      });
    });

    const EXCLUDED = [
      'traditional',
      'traditional dresses',
      'traditional wear',
      'joyful toys',
      'toys',
      'toy',
      'accessories',
      'accessory',
      'baby dresses',
      'dresses',
      'all dresses',
      'clothing',
    ];

    // Only allow genuinely new custom dress categories
    initialProducts.forEach((p) => {
      const catName = p.categories?.name?.trim();
      if (catName) {
        const lower = catName.toLowerCase();
        const isExcluded = EXCLUDED.some(
          (exc) => lower === exc || lower.includes('toy') || lower.includes('accessor')
        );
        if (!seen.has(lower) && !isExcluded) {
          seen.add(lower);
          list.push({
            label: catName,
            style: CAT_STYLE_PALETTE[list.length % CAT_STYLE_PALETTE.length],
          });
        }
      }

      // Check style tag from description: [STYLE: ...]
      if (p.description) {
        const match = p.description.match(/\[STYLE:\s*([^\]]+)\]/i);
        if (match && match[1]) {
          const styleName = match[1].trim();
          const lower = styleName.toLowerCase();
          const isExcluded = EXCLUDED.some(
            (exc) => lower === exc || lower.includes('toy') || lower.includes('accessor')
          );
          if (!seen.has(lower) && !isExcluded) {
            seen.add(lower);
            list.push({
              label: styleName,
              style: CAT_STYLE_PALETTE[list.length % CAT_STYLE_PALETTE.length],
            });
          }
        }
      }
    });

    return list;
  }, [initialProducts]);

  useEffect(() => {
    if (urlQuery !== undefined) {
      setSearchQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    if (maxAvailablePrice > 5000) {
      setMaxPrice(maxAvailablePrice);
    }
  }, [maxAvailablePrice]);

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

      // 2. Category filter — matches category name, style tag, or dress type keywords
      if (selectedCategory !== 'All Dresses') {
        const catName = (product.categories?.name || '').toLowerCase().trim();
        const sel = selectedCategory.toLowerCase().trim();
        const name = (product.name || '').toLowerCase();

        let productStyle = '';
        if (product.description) {
          const match = product.description.match(/\[STYLE:\s*([^\]]+)\]/i);
          if (match && match[1]) {
            productStyle = match[1].toLowerCase().trim();
          }
        }

        const isExactCategory = catName === sel;
        const isStyleMatch = productStyle === sel;

        let isKeywordMatch = false;
        if (sel.includes('traditional')) {
          isKeywordMatch =
            catName.includes('traditional') ||
            productStyle.includes('traditional') ||
            name.includes('traditional') ||
            name.includes('kasavu');
        } else if (sel.includes('casual')) {
          isKeywordMatch =
            catName.includes('casual') ||
            productStyle.includes('casual') ||
            name.includes('casual');
        } else if (sel.includes('party')) {
          isKeywordMatch =
            catName.includes('party') ||
            productStyle.includes('party') ||
            name.includes('party');
        } else if (sel.includes('romper')) {
          isKeywordMatch =
            catName.includes('romper') ||
            productStyle.includes('romper') ||
            name.includes('romper');
        } else if (sel.includes('frock')) {
          isKeywordMatch =
            catName.includes('frock') ||
            productStyle.includes('frock') ||
            name.includes('frock');
        }

        if (!isExactCategory && !isStyleMatch && !isKeywordMatch) {
          return false;
        }
      }

      // 3. Size / Age filter
      if (selectedSizes.length > 0) {
        if (!matchesAgeGroup(product.suitable_ages, selectedSizes)) {
          return false;
        }
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
    setMaxPrice(maxAvailablePrice > 5000 ? maxAvailablePrice : 10000);
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

      {/* ── Horizontal Category Tabs — Symmetric 2-col on mobile, flex on desktop ── */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 mb-8">
        {/* All Dresses tab always first */}
        {(() => {
          const allStyle = CAT_STYLE_PALETTE[0];
          const AllIcon = allStyle.icon;
          const isActive = selectedCategory === 'All Dresses';
          return (
            <button
              key="all"
              type="button"
              onClick={() => setSelectedCategory('All Dresses')}
              className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 rounded-2xl border transition-all text-left w-full sm:w-auto ${
                isActive
                  ? 'border-[#FB7185] bg-[#FFF0F2] ring-2 ring-[#FB7185]/40 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center shadow-2xs transition-colors ${
                isActive ? 'bg-[#FB7185] text-white' : 'bg-pink-50 text-pink-500'
              }`}>
                <AllIcon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-[#FB7185]' : 'text-slate-700'}`}>
                All Dresses
              </span>
            </button>
          );
        })()}

        {allCategories.map(({ label, style }) => {
          const CatIcon = style.icon;
          const isActive = selectedCategory === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedCategory(label)}
              className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 rounded-2xl border transition-all text-left w-full sm:w-auto ${
                isActive
                  ? 'border-[#FB7185] bg-[#FFF0F2] ring-2 ring-[#FB7185]/40 shadow-xs'
                  : `${style.border} ${style.bg} hover:border-slate-300`
              }`}
            >
              <div className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center shadow-2xs transition-colors ${
                isActive ? 'bg-[#FB7185] text-white' : 'bg-white/90'
              }`}>
                <CatIcon className={`w-4 h-4 ${isActive ? 'text-white' : style.iconColor}`} />
              </div>
              <span className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-[#FB7185]' : 'text-slate-700'}`}>
                {label}
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
            {(selectedCategory !== 'All Dresses' || selectedSizes.length > 0 || maxPrice < maxAvailablePrice || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-semibold text-[#FB7185] hover:underline cursor-pointer"
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
              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none hover:text-[#FB7185] transition-colors">
                <input
                  type="radio"
                  name="sidebarCategory"
                  checked={selectedCategory === 'All Dresses'}
                  onChange={() => setSelectedCategory('All Dresses')}
                  className="w-3.5 h-3.5 accent-[#FB7185] rounded cursor-pointer"
                />
                <span className={selectedCategory === 'All Dresses' ? 'text-[#FB7185] font-bold' : ''}>
                  All Dresses
                </span>
              </label>

              {allCategories.map((cat) => {
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

          {/* Section 2: Age Group */}
          <div className="mb-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-[#0F172A]">
                Age Group
              </h3>
              {selectedSizes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSizes([])}
                  className="text-[10px] font-semibold text-[#FB7185] hover:underline cursor-pointer"
                >
                  Clear ({selectedSizes.length})
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {AGE_GROUPS.map((age) => {
                const isChecked = selectedSizes.includes(age);
                return (
                  <label
                    key={age}
                    className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none hover:text-[#FB7185] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSize(age)}
                      className="w-3.5 h-3.5 accent-[#FB7185] rounded cursor-pointer"
                    />
                    <span className={isChecked ? 'text-[#FB7185] font-bold' : ''}>
                      {age}
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
              max={maxAvailablePrice}
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
              {filteredProducts.map((product, idx) => {
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
                          src={getOptimizedImageUrl(product.image_url, { width: 500 })}
                          alt={product.name}
                          fill
                          priority={idx < 5}
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
                        {product.suitable_ages && product.suitable_ages.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.suitable_ages.slice(0, 2).map((age) => (
                              <span key={age} className="text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded">
                                {age}
                              </span>
                            ))}
                            {product.suitable_ages.length > 2 && (
                              <span className="text-[9px] text-slate-400 font-medium self-center">
                                +{product.suitable_ages.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap mb-2.5">
                          <p className="text-xs sm:text-sm font-black text-[#0284C7]">
                            ₹{priceNum.toLocaleString('en-IN')}
                          </p>
                          {product.mrp && Number(product.mrp) > priceNum && (
                            <>
                              <span className="text-[11px] text-slate-400 line-through">
                                ₹{Number(product.mrp).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                {Math.round(((Number(product.mrp) - priceNum) / Number(product.mrp)) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
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
