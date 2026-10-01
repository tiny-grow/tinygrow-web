import { createClient, isSupabaseServerConfigured } from './server';
import {
  Category,
  Product,
  HeroBanner,
  AboutSection,
  ContactInformation,
  SocialLink,
  Promotion,
} from './types';

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseServerConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) {
      if (error) console.error('Error fetching categories:', error);
      return [];
    }
    // Only exclude categories explicitly marked inactive (active === false)
    return (data as Category[]).filter((c) => c.active !== false);
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export async function getProducts(options?: {
  featured?: boolean;
  isNewArrival?: boolean;
  isToy?: boolean;
  isAccessory?: boolean;
  isDress?: boolean;
  categorySlug?: string;
  limit?: number;
}): Promise<Product[]> {
  if (!isSupabaseServerConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });

    if (options?.featured) {
      query = query.eq('featured', true);
    }
    if (options?.isNewArrival) {
      query = query.eq('is_new_arrival', true);
    }
    if (options?.isToy || options?.categorySlug === 'toys') {
      query = query.eq('is_toy', true);
    } else if (options?.isAccessory || options?.categorySlug === 'accessories') {
      query = query.eq('is_accessory', true);
    } else if (options?.isDress || options?.categorySlug === 'dresses' || options?.categorySlug === 'clothing') {
      // Dresses are all clothing products that are not toys and not accessories
      query = query.eq('is_toy', false).eq('is_accessory', false);
    } else if (options?.categorySlug) {
      let { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', options.categorySlug)
        .maybeSingle();

      if (!cat) {
        const { data: catByName } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', `%${options.categorySlug}%`)
          .maybeSingle();
        cat = catByName;
      }

      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    let { data, error } = await query;

    // Fallback: If join on categories(*) failed, query products directly
    if (error) {
      console.warn('Products query with join failed, falling back to direct select:', error.message);
      let fallbackQuery = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (options?.featured) fallbackQuery = fallbackQuery.eq('featured', true);
      if (options?.isNewArrival) fallbackQuery = fallbackQuery.eq('is_new_arrival', true);
      if (options?.isToy || options?.categorySlug === 'toys') {
        fallbackQuery = fallbackQuery.eq('is_toy', true);
      } else if (options?.isAccessory || options?.categorySlug === 'accessories') {
        fallbackQuery = fallbackQuery.eq('is_accessory', true);
      } else if (options?.isDress || options?.categorySlug === 'dresses' || options?.categorySlug === 'clothing') {
        fallbackQuery = fallbackQuery.eq('is_toy', false).eq('is_accessory', false);
      }
      if (options?.limit) fallbackQuery = fallbackQuery.limit(options.limit);
      const fallbackRes = await fallbackQuery;
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error || !data) return [];
    return (data as Product[]).map((p) => {
      let mrp = p.mrp ? Number(p.mrp) : null;
      if (!mrp && p.description && p.description.includes('[MRP:')) {
        const match = p.description.match(/\[MRP:\s*([0-9.]+)\]/);
        if (match && match[1]) {
          mrp = Number(match[1]);
        }
      }
      return {
        ...p,
        price: Number(p.price) || 0,
        mrp: mrp && !isNaN(mrp) ? mrp : null,
      };
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseServerConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    const p = data as Product;
    let mrp = p.mrp ? Number(p.mrp) : null;
    if (!mrp && p.description && p.description.includes('[MRP:')) {
      const match = p.description.match(/\[MRP:\s*([0-9.]+)\]/);
      if (match && match[1]) {
        mrp = Number(match[1]);
      }
    }
    return {
      ...p,
      price: Number(p.price) || 0,
      mrp: mrp && !isNaN(mrp) ? mrp : null,
    };
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return null;
  }
}

export function normalizeHeroBanner(banner: HeroBanner | null): HeroBanner | null {
  if (!banner) return null;

  let desktopUrls: string[] = [];
  let mobileUrls: string[] = [];

  // 1. Check if description has JSON payload containing banners
  if (banner.description && banner.description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(banner.description);
      if (Array.isArray(parsed.desktop_banners)) {
        desktopUrls = parsed.desktop_banners.filter(Boolean);
      }
      if (Array.isArray(parsed.mobile_banners)) {
        mobileUrls = parsed.mobile_banners.filter(Boolean);
      }
    } catch {
      // not JSON
    }
  }

  // 2. Check native columns if present
  if (Array.isArray(banner.desktop_banner_urls) && banner.desktop_banner_urls.length > 0) {
    desktopUrls = banner.desktop_banner_urls.filter(Boolean);
  } else if (desktopUrls.length === 0 && banner.image_url) {
    desktopUrls = [banner.image_url];
  }

  if (Array.isArray(banner.mobile_banner_urls) && banner.mobile_banner_urls.length > 0) {
    mobileUrls = banner.mobile_banner_urls.filter(Boolean);
  } else if (mobileUrls.length === 0 && banner.mobile_image_url) {
    mobileUrls = [banner.mobile_image_url];
  }

  return {
    ...banner,
    desktop_banner_urls: desktopUrls.slice(0, 2),
    mobile_banner_urls: mobileUrls.slice(0, 2),
    image_url: desktopUrls[0] || banner.image_url || null,
    mobile_image_url: mobileUrls[0] || banner.mobile_image_url || null,
  };
}

export async function getHeroBanner(): Promise<HeroBanner | null> {
  if (!isSupabaseServerConfigured()) return null;
  try {
    const supabase = await createClient();
    // Fetch the most recently updated banner row (active or not)
    // so the storefront always shows whatever the admin last saved.
    const { data, error } = await supabase
      .from('hero_banner')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return normalizeHeroBanner(data as HeroBanner);
  } catch (err) {
    console.error('Error fetching hero banner:', err);
    return null;
  }
}

export async function getAboutSection(): Promise<AboutSection | null> {
  if (!isSupabaseServerConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('about_section')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as AboutSection;
  } catch (err) {
    console.error('Error fetching about section:', err);
    return null;
  }
}

export async function getContactInformation(): Promise<ContactInformation | null> {
  if (!isSupabaseServerConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contact_information')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as ContactInformation;
  } catch (err) {
    console.error('Error fetching contact information:', err);
    return null;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (!isSupabaseServerConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as SocialLink[];
  } catch (err) {
    console.error('Error fetching social links:', err);
    return [];
  }
}

export async function getPromotions(): Promise<Promotion[]> {
  if (!isSupabaseServerConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true);

    if (error || !data) return [];
    return data as Promotion[];
  } catch (err) {
    console.error('Error fetching promotions:', err);
    return [];
  }
}
