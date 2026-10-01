export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  suitable_ages: string[];
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  featured: boolean;
  is_new_arrival: boolean;
  is_toy: boolean;
  is_accessory: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: Category | null;
}

export interface HeroBanner {
  id: string;
  badge_text: string | null;
  title: string;
  title_highlight: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  mobile_image_url?: string | null;
  mobile_banner_urls?: string[] | null;
  button_text: string | null;
  button_link: string | null;
  feature_1_title: string | null;
  feature_2_title: string | null;
  feature_3_title: string | null;
  feature_4_title: string | null;
  active: boolean;
}

export interface AboutSection {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  feature_items: string[];
  active: boolean;
}

export interface ContactInformation {
  id?: string;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  business_hours: string | null;
  announcement_text: string | null;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  active: boolean;
  display_order: number;
}

export interface Promotion {
  id: string;
  card_key: string;
  title: string;
  subtitle: string | null;
  tagline: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  active: boolean;
}

export const AGE_GROUP_OPTIONS = [
  '0–3 Months',
  '3–6 Months',
  '6–12 Months',
  '1–2 Years',
  '2–3 Years',
  '3–4 Years',
  '4–5 Years',
  '5–6 Years',
  '6–8 Years',
  '8–10 Years',
];
