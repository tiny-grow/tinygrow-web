import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryCards from '@/components/CategoryCards';
import NewArrivals from '@/components/NewArrivals';
import TinyEssentials from '@/components/TinyEssentials';
import PromoBanners from '@/components/PromoBanners';
import Footer from '@/components/Footer';
import { Product } from '@/lib/supabase/types';
import {
  getCategories,
  getProducts,
  getHeroBanner,
  getAboutSection,
  getContactInformation,
  getSocialLinks,
  getPromotions,
} from '@/lib/supabase/queries';

export const revalidate = 0; // Always fresh data from Supabase

// Helper to pick a diverse mix of products across different categories/types
function getMixedProducts(allProducts: Product[], count = 5): Product[] {
  if (!allProducts || allProducts.length === 0) return [];

  const getBucketKey = (p: Product) => {
    if (p.is_toy) return 'toys';
    if (p.is_accessory) return 'accessories';
    if (p.categories?.slug) return p.categories.slug;
    if (p.category_id) return p.category_id;
    return 'general';
  };

  const buckets: { [key: string]: Product[] } = {};
  for (const product of allProducts) {
    const key = getBucketKey(product);
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(product);
  }

  const selected: Product[] = [];
  const selectedIds = new Set<string>();

  // Prioritize new arrivals if flagged, mixing across categories
  const newArrivals = allProducts.filter((p) => p.is_new_arrival);
  if (newArrivals.length > 0) {
    const naBuckets: { [key: string]: Product[] } = {};
    for (const p of newArrivals) {
      const k = getBucketKey(p);
      if (!naBuckets[k]) naBuckets[k] = [];
      naBuckets[k].push(p);
    }
    const naKeys = Object.keys(naBuckets);
    let round = 0;
    while (selected.length < count && selectedIds.size < newArrivals.length) {
      let added = false;
      for (const k of naKeys) {
        if (selected.length >= count) break;
        const list = naBuckets[k];
        if (round < list.length && !selectedIds.has(list[round].id)) {
          selected.push(list[round]);
          selectedIds.add(list[round].id);
          added = true;
        }
      }
      round++;
      if (!added) break;
    }
  }

  // Interleave round-robin across all category buckets
  const bucketKeys = Object.keys(buckets);
  let round = 0;
  while (selected.length < count && selectedIds.size < allProducts.length) {
    let added = false;
    for (const key of bucketKeys) {
      if (selected.length >= count) break;
      const list = buckets[key];
      if (round < list.length) {
        const item = list[round];
        if (!selectedIds.has(item.id)) {
          selected.push(item);
          selectedIds.add(item.id);
          added = true;
        }
      }
    }
    round++;
    if (!added) break;
  }

  // Fallback if needed to reach count
  for (const item of allProducts) {
    if (selected.length >= count) break;
    if (!selectedIds.has(item.id)) {
      selected.push(item);
      selectedIds.add(item.id);
    }
  }

  return selected.slice(0, count);
}

export default async function HomePage() {
  // Fetch real data from Supabase (or empty if not yet configured)
  const [
    categories,
    products,
    heroBanner,
    aboutSection,
    contactInfo,
    socialLinks,
    promotions,
  ] = await Promise.all([
    getCategories(),
    getProducts({ limit: 50 }),
    getHeroBanner(),
    getAboutSection(),
    getContactInformation(),
    getSocialLinks(),
    getPromotions(),
  ]);

  const displayProducts = getMixedProducts(products, 10);

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      {/* Top Announcement Bar */}
      <AnnouncementBar text={contactInfo?.announcement_text} />

      {/* Main Header */}
      <Header />

      <main className="flex-1 w-full">
        {/* Section 1: Hero */}
        <Hero banner={heroBanner} />

        {/* Section 2: Category Feature Cards */}
        <CategoryCards categories={categories} />

        {/* Section 3: New Arrivals Grid */}
        <NewArrivals
          products={displayProducts}
          whatsappNumber={contactInfo?.whatsapp_number}
        />

        {/* Section 4: Tiny Essentials Section */}
        <TinyEssentials about={aboutSection} />

        {/* Section 5: Lower Promotional Sections */}
        <PromoBanners promotions={promotions} />
      </main>

      {/* Section 7: Footer */}
      <Footer contact={contactInfo} socials={socialLinks} />
    </div>
  );
}
