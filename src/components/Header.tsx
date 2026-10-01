'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, Loader2, ArrowRight } from 'lucide-react';
import BrandLogo from './BrandLogo';

const navLinks = [
  { label: 'Dresses', href: '/category/dresses' },
  { label: 'Accessories', href: '/category/accessories' },
  { label: 'Toys', href: '/category/toys' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'All Products', href: '/shop' },
  // { label: 'Offers', href: '/shop?filter=offers' }, // hidden for now
];

function checkIsActive(linkHref: string, pathname: string | null, currentFilter: string | null) {
  if (linkHref === '/shop?filter=offers') {
    return pathname === '/shop' && currentFilter === 'offers';
  }
  if (linkHref === '/shop') {
    return pathname === '/shop' && currentFilter !== 'offers';
  }
  return pathname === linkHref || (linkHref !== '/' && !!pathname?.startsWith(linkHref));
}

function DesktopNavWithParams({ pathname }: { pathname: string | null }) {
  const searchParams = useSearchParams();
  const currentFilter = searchParams ? searchParams.get('filter') : null;
  return <DesktopNavList pathname={pathname} currentFilter={currentFilter} />;
}

function DesktopNavList({ pathname, currentFilter }: { pathname: string | null; currentFilter: string | null }) {
  return (
    <nav className="hidden lg:flex items-center gap-7">
      {navLinks.map((link) => {
        const isActive = checkIsActive(link.href, pathname, currentFilter);
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`relative text-sm font-semibold transition-colors pb-0.5 ${
              isActive
                ? 'text-[#FB7185]'
                : 'text-[#1E293B] hover:text-[#FB7185]'
            }`}
          >
            {link.label}
            {isActive && (
              <span className="absolute left-0 -bottom-1 w-full h-[2.5px] bg-[#FB7185] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function DesktopNav({ pathname }: { pathname: string | null }) {
  return (
    <Suspense fallback={<DesktopNavList pathname={pathname} currentFilter={null} />}>
      <DesktopNavWithParams pathname={pathname} />
    </Suspense>
  );
}

function MobileNavWithParams({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  const searchParams = useSearchParams();
  const currentFilter = searchParams ? searchParams.get('filter') : null;
  return <MobileNavList pathname={pathname} currentFilter={currentFilter} onNavigate={onNavigate} />;
}

function MobileNavList({
  pathname,
  currentFilter,
  onNavigate,
}: {
  pathname: string | null;
  currentFilter: string | null;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex flex-col gap-2 pt-1">
      {navLinks.map((link) => {
        const isActive = checkIsActive(link.href, pathname, currentFilter);
        return (
          <Link
            key={link.label}
            href={link.href}
            onClick={onNavigate}
            className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center justify-between ${
              isActive
                ? 'bg-pink-50 text-[#FB7185]'
                : 'text-[#1E293B] hover:bg-pink-50 hover:text-[#FB7185]'
            }`}
          >
            {link.label}
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  return (
    <Suspense fallback={<MobileNavList pathname={pathname} currentFilter={null} onNavigate={onNavigate} />}>
      <MobileNavWithParams pathname={pathname} onNavigate={onNavigate} />
    </Suspense>
  );
}

interface SearchItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number | null;
  image_url: string | null;
  type: string;
  is_toy: boolean;
  is_accessory: boolean;
}

function SearchDropdown({
  isLoading,
  results,
  query,
  onSelect,
  onViewAll,
}: {
  isLoading: boolean;
  results: SearchItem[];
  query: string;
  onSelect: () => void;
  onViewAll: () => void;
}) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  return (
    <div className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
      {isLoading ? (
        <div className="py-7 px-4 flex items-center justify-center gap-2.5 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#FB7185]" />
          <span>Searching matching products...</span>
        </div>
      ) : results.length > 0 ? (
        <div>
          <div className="px-3.5 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Matching Products ({results.length})</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">press enter for all</span>
          </div>
          <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-50">
            {results.map((product) => {
              let badgeStyle = 'bg-rose-50 text-rose-500 border-rose-200/60';
              if (product.is_toy) {
                badgeStyle = 'bg-amber-50 text-amber-600 border-amber-200/60';
              } else if (product.is_accessory) {
                badgeStyle = 'bg-purple-50 text-purple-600 border-purple-200/60';
              }

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={onSelect}
                  className="flex items-center gap-3 p-3 hover:bg-pink-50/50 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#FB7185] truncate transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-slate-900">
                        ₹{product.price}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeStyle}`}
                      >
                        {product.type}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#FB7185] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-900 text-center transition-colors border-t border-slate-100 flex items-center justify-center gap-1.5"
          >
            <span>View all matching results for &ldquo;{trimmed}&rdquo;</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="py-6 px-4 text-center">
          <p className="text-xs font-medium text-slate-700">
            No products found matching &ldquo;{trimmed}&rdquo;
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Try searching for frocks, dresses, toys, or accessories
          </p>
          <button
            type="button"
            onClick={onViewAll}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FB7185] hover:underline"
          >
            Search in All Products →
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearchQuery(q);
    }
  }, [pathname]);

  // Close dropdown on navigation
  useEffect(() => {
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle outside click & escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideDesktop = desktopSearchRef.current?.contains(target);
      const insideMobile = mobileSearchRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounced live search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('tinygrow_cart') : null;
        if (raw) {
          const items = JSON.parse(raw);
          const total = Array.isArray(items)
            ? items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0)
            : 0;
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('tinygrow_cart_updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('tinygrow_cart_updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDropdownOpen(false);
    const q = searchQuery.trim();
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/shop');
    }
    setMobileMenuOpen(false);
  };

  const handleSelectProduct = () => {
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-slate-100 px-4 sm:px-8 py-3.5 sm:py-4 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Logo */}
        <div className="flex-shrink-0">
          <BrandLogo />
        </div>

        {/* Desktop Navigation Links */}
        <DesktopNav pathname={pathname} />

        {/* Right Section: Search & Utility Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search Bar & Dropdown */}
          <div ref={desktopSearchRef} className="relative hidden sm:block w-52 md:w-64">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dresses, toys, accessories..."
                className="w-full bg-[#F1F5F9] text-xs sm:text-sm text-[#1E293B] placeholder-[#94A3B8] rounded-full py-2 pl-4 pr-14 border border-transparent focus:outline-none focus:border-[#38BDF8] focus:bg-white transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FB7185]" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="text-[#64748B] hover:text-[#1E293B] p-1 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {isDropdownOpen && searchQuery.trim() && (
              <SearchDropdown
                isLoading={isSearching}
                results={searchResults}
                query={searchQuery}
                onSelect={handleSelectProduct}
                onViewAll={() => handleSearch()}
              />
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-[#1E293B]">
            <Link
              href="/cart"
              className="relative p-2 hover:text-[#FB7185] hover:bg-pink-50 rounded-full transition-colors"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#FB7185] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-[#1E293B] hover:bg-slate-100 rounded-lg transition-colors ml-1"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-100 pb-3 flex flex-col gap-3">
          <div ref={mobileSearchRef} className="relative sm:hidden w-full">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dresses, toys, accessories..."
                className="w-full bg-[#F1F5F9] text-sm text-[#1E293B] placeholder-[#94A3B8] rounded-full py-2 pl-4 pr-14 border border-transparent focus:outline-none focus:border-[#38BDF8]"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FB7185]" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="text-[#64748B] hover:text-[#1E293B] p-1 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {isDropdownOpen && searchQuery.trim() && (
              <SearchDropdown
                isLoading={isSearching}
                results={searchResults}
                query={searchQuery}
                onSelect={handleSelectProduct}
                onViewAll={() => handleSearch()}
              />
            )}
          </div>

          <MobileNav pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
