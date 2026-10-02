import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  href?: string;
  className?: string;
}

export default function BrandLogo({ href = '/', className = '' }: BrandLogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center select-none ${className}`}>
      <div className="relative h-10 sm:h-[50px] w-40 sm:w-52">
        <Image
          src="/tinygrow-logo.png"
          alt="TinyGrow"
          fill
          sizes="(max-width: 640px) 160px, 208px"
          priority
          className="object-contain object-left"
        />
      </div>
    </Link>
  );
}
