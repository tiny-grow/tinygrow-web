'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearchQuery(q);
    }
  }, [pathname]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/shop');
    }
    setMobileMenuOpen(false);
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
          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="relative hidden sm:block w-52 md:w-64"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for dresses, toys..."
              className="w-full bg-[#F1F5F9] text-xs sm:text-sm text-[#1E293B] placeholder-[#94A3B8] rounded-full py-2 pl-4 pr-9 border border-transparent focus:outline-none focus:border-[#38BDF8] focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

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
          <form onSubmit={handleSearch} className="relative sm:hidden w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for dresses, toys..."
              className="w-full bg-[#F1F5F9] text-sm text-[#1E293B] placeholder-[#94A3B8] rounded-full py-2 pl-4 pr-9 border border-transparent focus:outline-none focus:border-[#38BDF8]"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <MobileNav pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
