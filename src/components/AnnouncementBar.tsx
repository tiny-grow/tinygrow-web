import { Truck } from 'lucide-react';
import Link from 'next/link';

interface AnnouncementBarProps {
  text?: string | null;
}

export default function AnnouncementBar({ text }: AnnouncementBarProps) {
  const defaultText = "Free shipping on orders above ₹999 | Easy WhatsApp Ordering | 100% Baby-Safe Products";
  const displayText = text || defaultText;

  return (
    <aside aria-label="Announcement" className="w-full bg-[#E1F0FA] text-[#334155] border-b border-[#D0E6F5] text-xs py-1.5 sm:py-2 px-3 sm:px-8 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 text-[11px] sm:text-xs font-medium">
        {/* Mobile View: Single continuous straight line with smooth ticker scroll */}
        <div className="sm:hidden w-full overflow-hidden whitespace-nowrap">
          <div className="animate-marquee">
            <span className="inline-flex items-center gap-1.5 pr-8">
              <Truck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span className="whitespace-nowrap">{displayText}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 pr-8">
              <Truck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span className="whitespace-nowrap">{displayText}</span>
            </span>
          </div>
        </div>

        {/* Desktop View: Static single straight line */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 whitespace-nowrap justify-center flex-1">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
            <span>{displayText}</span>
          </span>
        </div>

        {/* Desktop Quick Links */}
        <div className="hidden sm:flex items-center gap-3 text-[#475569] shrink-0">
          <Link href="#help" className="hover:text-[#0284C7] transition-colors">
            Help
          </Link>
          <span className="text-[#94A3B8]">|</span>
          <Link href="#track" className="hover:text-[#0284C7] transition-colors">
            Track Order
          </Link>
        </div>
      </div>
    </aside>
  );
}
