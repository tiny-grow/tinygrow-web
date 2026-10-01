'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  ShoppingBag,
  Image as ImageIcon,
  PhoneCall,
  Share2,
  LogOut,
  Globe,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ToyBrick,
  Tag,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'text-sky-400' },
  { label: 'Hero Banner', href: '/admin/hero', icon: Sparkles, color: 'text-yellow-400' },
  { label: 'Categories', href: '/admin/categories', icon: Layers, color: 'text-purple-400' },
  { label: 'Products', href: '/admin/products', icon: ShoppingBag, color: 'text-pink-400' },
  { label: 'Toys', href: '/admin/toys', icon: ToyBrick, color: 'text-emerald-400' },
  { label: 'Accessories', href: '/admin/accessories', icon: Tag, color: 'text-violet-400' },
  { label: 'Homepage Banners', href: '/admin/banners', icon: ImageIcon, color: 'text-pink-400' },
  { label: 'Contact & Info', href: '/admin/contact', icon: PhoneCall, color: 'text-orange-400' },
  { label: 'Social Links', href: '/admin/social', icon: Share2, color: 'text-blue-400' },
];

function SidebarContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  const router = useRouter();

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push('/admin/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header with Exact Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3.5 group">
          <div className="bg-white rounded-2xl p-2 shrink-0 shadow-md flex items-center justify-center w-12 h-12 group-hover:scale-105 transition-transform duration-200">
            <div className="relative w-full h-full">
              <Image
                src="/tinygrow-logo.png"
                alt="Admin Portal Logo"
                fill
                sizes="48px"
                priority
                className="object-contain object-center"
              />
            </div>
          </div>
          <div>
            <span className="text-white font-extrabold text-base tracking-tight block leading-tight">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 pt-2 pb-1">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                isActive ? 'bg-white/15' : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Utilities */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          onClick={onNav}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
        >
          <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </span>
          <span className="flex-1">View Storefront</span>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/30">LIVE</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-left group cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-rose-500/10 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === '/admin/login') return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#0F172A] border-r border-white/5 h-screen sticky top-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile: Top bar with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0F172A] border-b border-white/10 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-1.5 flex items-center justify-center w-9 h-9 shrink-0 shadow-xs">
            <div className="relative w-full h-full">
              <Image
                src="/tinygrow-logo.png"
                alt="Admin Portal Logo"
                fill
                sizes="36px"
                className="object-contain object-center"
              />
            </div>
          </div>
          <span className="text-white font-extrabold text-sm tracking-tight">Admin Portal</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-[#0F172A] h-full flex flex-col shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white z-10 cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent pathname={pathname} onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
