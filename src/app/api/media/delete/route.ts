import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Extracts the Cloudinary public_id from a full Cloudinary image URL.
 * Handles paths with or without version strings (v1234567890/) and transformation segments.
 */
function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    // Regex matches whatever comes after /image/upload/ (skipping optional transformations and version tags)
    const match = url.match(/\/image\/upload\/(?:(?:[a-zA-Z0-9_,]+|c_[^/]+)\/)*(?:v\d+\/)?([^?#]+)/);
    if (!match || !match[1]) return null;

    let path = match[1];
    // Remove the file extension (e.g. .jpg, .png, .webp)
    const dotIndex = path.lastIndexOf('.');
    if (dotIndex !== -1) {
      path = path.substring(0, dotIndex);
    }
    return decodeURIComponent(path);
  } catch (err) {
    console.error('Failed to extract Cloudinary public_id from URL:', url, err);
    return null;
  }
}

/**
 * Extracts bucket and file path from a Supabase public storage URL.
 */
function extractSupabaseStoragePath(url: string): { bucket: string; path: string } | null {
  if (!url || typeof url !== 'string' || !url.includes('/storage/v1/object/public/')) {
    return null;
  }

  try {
    const parts = url.split('/storage/v1/object/public/');
    if (parts.length < 2) return null;
    const remaining = parts[1].split('?')[0];
    const slashIdx = remaining.indexOf('/');
    if (slashIdx === -1) return null;

    const bucket = remaining.substring(0, slashIdx);
    const path = decodeURIComponent(remaining.substring(slashIdx + 1));
    return { bucket, path };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // 1. Verify Authentication if in production with Supabase configured
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && isSupabaseServerConfigured()) {
    try {
      const supabase = await createClient();
      let user = null;

      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data } = await supabase.auth.getUser(token);
        user = data?.user;
      }

      if (!user) {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin login required' },
          { status: 401 }
        );
      }
    } catch (authErr) {
      console.warn('Auth verification warning in delete media:', authErr);
    }
  }

  // 2. Parse request body
  let urls: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body.urls)) {
      urls = body.urls;
    } else if (typeof body.url === 'string') {
      urls = [body.url];
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const cleanUrls = urls
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => u.length > 0);

  if (cleanUrls.length === 0) {
    return NextResponse.json({ success: true, deleted: [] });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const results: { url: string; source: 'cloudinary' | 'supabase' | 'unknown'; status: string }[] = [];

  // 3. Process each URL
  for (const url of cleanUrls) {
    // A. Check if Cloudinary URL
    const publicId = extractCloudinaryPublicId(url);
    if (publicId && cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        // Parameters in alphabetical order: invalidate, public_id, timestamp
        const signatureString = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('invalidate', 'true');

        const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
        const res = await fetch(destroyUrl, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        results.push({
          url,
          source: 'cloudinary',
          status: data.result === 'ok' ? 'deleted' : data.result || 'error',
        });
      } catch (err: unknown) {
        console.error('Error deleting image from Cloudinary:', url, err);
        results.push({
          url,
          source: 'cloudinary',
          status: err instanceof Error ? err.message : 'error',
        });
      }
      continue;
    }

    // B. Check if Supabase Storage URL
    const storagePath = extractSupabaseStoragePath(url);
    if (storagePath && isSupabaseServerConfigured()) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.storage
          .from(storagePath.bucket)
          .remove([storagePath.path]);

        results.push({
          url,
          source: 'supabase',
          status: error ? error.message : 'deleted',
        });
      } catch (err: unknown) {
        console.error('Error deleting image from Supabase storage:', url, err);
        results.push({
          url,
          source: 'supabase',
          status: err instanceof Error ? err.message : 'error',
        });
      }
      continue;
    }

    // Non-cloud or external URL (placeholder/unsplash/etc.)
    results.push({
      url,
      source: 'unknown',
      status: 'skipped (external or unconfigured)',
    });
  }

  return NextResponse.json({ success: true, deleted: results });
}
