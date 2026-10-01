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
    if (options?.isToy) {
      query = query.eq('is_toy', true);
    }
    if (options?.isAccessory) {
      query = query.eq('is_accessory', true);
    }
    if (options?.categorySlug) {
      if (options.categorySlug === 'toys') {
        query = query.eq('is_toy', true);
      } else if (options.categorySlug === 'accessories') {
        query = query.eq('is_accessory', true);
      } else {
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
      if (options?.isToy) fallbackQuery = fallbackQuery.eq('is_toy', true);
      if (options?.isAccessory) fallbackQuery = fallbackQuery.eq('is_accessory', true);
      if (options?.limit) fallbackQuery = fallbackQuery.limit(options.limit);
      const fallbackRes = await fallbackQuery;
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error || !data) return [];
    return data as Product[];
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
    return data as Product;
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return null;
  }
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
    return data as HeroBanner;
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
