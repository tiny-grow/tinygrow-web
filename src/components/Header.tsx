'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      if (pathname?.includes('dresses')) {
        router.push(`/category/dresses?q=${encodeURIComponent(q)}`);
      } else {
        router.push(`/shop?q=${encodeURIComponent(q)}`);
      }
    } else {
      if (pathname?.includes('dresses')) {
        router.push('/category/dresses');
      }
    }
  };

  const navLinks = [
    { label: 'Dresses', href: '/category/dresses' },
    { label: 'Accessories', href: '/category/accessories' },
    { label: 'Toys', href: '/category/toys' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'All Products', href: '/shop' },
    { label: 'Offers', href: '/shop?filter=offers' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-100 px-4 sm:px-8 py-3.5 sm:py-4 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Logo */}
        <div className="flex-shrink-0">
          <BrandLogo />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href.split('?')[0]));
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
              href="/shop"
              className="relative p-2 hover:text-[#FB7185] hover:bg-pink-50 rounded-full transition-colors"
              title="Bag"
              aria-label="Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="absolute 1 top-0.5 right-0.5 bg-[#FB7185] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
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

          <nav className="flex flex-col gap-2 pt-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href.split('?')[0]));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
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
        </div>
      )}
    </header>
  );
}
