import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductOrderPanel from '@/components/ProductOrderPanel';
import {
  getProductBySlug,
  getContactInformation,
  getSocialLinks,
} from '@/lib/supabase/queries';

export const revalidate = 0;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

// ── Open Graph / WhatsApp link-preview metadata ──────────────────────────────
export async function generateMetadata(
  { params }: ProductDetailPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product not found | TinyGrow' };
  }

  const title = `${product.name} | TinyGrow`;
  const description =
    product.description ||
    `Shop ${product.name} at TinyGrow — premium baby & kids clothing delivered to your door.`;
  const imageUrl = product.image_url ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const [product, contactInfo, socialLinks] = await Promise.all([
    getProductBySlug(slug),
    getContactInformation(),
    getSocialLinks(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar text={contactInfo?.announcement_text} />
      <Header />

      <main className="flex-1 w-full px-4 sm:px-10 lg:px-12 py-6 sm:py-8 bg-white min-h-[600px]">
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 hover:text-[#FB7185] transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Shop</span>
              </Link>
              <span>/</span>
              {product.categories && (
                <>
                  <Link
                    href={`/category/${product.categories.slug}`}
                    className="hover:text-[#FB7185] transition-colors shrink-0"
                  >
                    {product.categories.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-slate-800 font-medium truncate max-w-[160px] sm:max-w-[240px]">
                {product.name}
              </span>
            </div>

            {/* Product Details Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-14 items-start">
              {/* Product Image Gallery */}
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#FAF5F2] border border-slate-100 flex items-center justify-center">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <span className="text-6xl mb-2">🧸</span>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                )}
              </div>

              {/* Product Info & WhatsApp Order Panel */}
              <div className="flex flex-col">
                {/* Category & Stock Status */}
                <div className="flex items-center gap-2 mb-2">
                  {product.categories && (
                    <span className="px-3 py-1 bg-pink-50 text-[#FB7185] text-xs font-bold rounded-full">
                      {product.categories.name}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock</span>
                  </span>
                </div>

                {/* Product Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-4">
                  ₹{Number(product.price).toLocaleString()}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-[#475569] leading-relaxed mb-6 pb-6 border-b border-slate-100">
                    {product.description}
                  </p>
                )}

                {/* Interactive Order Panel with Age Selector & WhatsApp CTA */}
                <ProductOrderPanel
                  product={product}
                  whatsappNumber={contactInfo?.whatsapp_number}
                />
              </div>
            </div>
          </div>
      </main>

      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
