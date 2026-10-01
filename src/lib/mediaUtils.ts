import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Deletes one or multiple images from Cloudinary and/or Supabase Storage.
 * Safe to pass null, undefined, or external URLs (which are gracefully skipped).
 */
export async function deleteMediaUrls(
  urls: (string | null | undefined)[]
): Promise<boolean> {
  const validUrls = urls
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => u.length > 0);

  if (validUrls.length === 0) return true;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
        }
      } catch {
        // Session fallback
      }
    }

    const res = await fetch('/api/media/delete', {
      method: 'POST',
      headers,
      body: JSON.stringify({ urls: validUrls }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.warn('Failed to delete media from storage:', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error invoking /api/media/delete:', err);
    return false;
  }
}
