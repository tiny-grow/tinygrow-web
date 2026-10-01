import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  href?: string;
  className?: string;
}

export default function BrandLogo({ href = '/', className = '' }: BrandLogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center select-none ${className}`}>
      <div className="flex flex-col">
        <div className="relative h-9 sm:h-11 w-32 sm:w-40">
          <Image
            src="/tinygrow-logo.png"
            alt="TinyGrow - Babies' Clothing"
            fill
            sizes="160px"
            priority
            className="object-contain object-left"
          />
        </div>
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wider text-[#64748B] -mt-0.5">
          Babies&apos; Clothing
        </span>
      </div>
    </Link>
  );
}
