import { createBrowserClient } from '@supabase/ssr';

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = getSupabaseAnonKey();
  return Boolean(url && anonKey && url.startsWith('http') && !url.includes('placeholder'));
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = getSupabaseAnonKey() || 'placeholder-anon-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
