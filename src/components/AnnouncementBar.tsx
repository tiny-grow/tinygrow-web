import { Truck } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string | null;
}

export default function AnnouncementBar({ text }: AnnouncementBarProps) {
  const defaultText = "Free Delivery Across India | Easy WhatsApp Ordering | 100% Baby-Safe Products";
  // If database contains stale "above ₹999", clean it up
  const rawText = text || defaultText;
  const displayText = rawText.replace(/on orders above ₹?999/gi, 'Across India').replace(/above ₹?999/gi, 'Across India');

  return (
    <aside aria-label="Announcement" className="w-full bg-[#E1F0FA] text-[#334155] border-b border-[#D0E6F5] text-xs py-1.5 sm:py-2 px-3 sm:px-8 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-[11px] sm:text-xs font-medium">
        {/* Mobile View: Continuous ticker scroll */}
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

        {/* Desktop View: Centered clean line without Help or Track Order */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 whitespace-nowrap justify-center">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
            <span>{displayText}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
