/**
 * Image Optimization Utilities for TinyGrow
 * 
 * Provides high-performance image transformations:
 * 1. Automatically transforms Cloudinary URLs to use modern AVIF/WebP formats (f_auto),
 *    perceptual quality compression (q_auto), and responsive max-width resizing (w_<width>,c_limit).
 * 2. Optimizes Unsplash images with auto=format&fit=crop&q=80.
 * 3. Provides shimmer blur placeholders for instant perception of loading.
 */

interface OptimizeImageOptions {
  width?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
}

/**
 * Transforms an image URL to a high-speed CDN delivery URL with automatic
 * WebP/AVIF format selection, perceptual quality optimization, and responsive sizing.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options?: OptimizeImageOptions
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Cloudinary URLs
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    // If it already has f_auto or transformations, don't re-transform
    if (
      trimmed.includes('/upload/f_auto') ||
      trimmed.includes('/upload/w_') ||
      trimmed.includes('/upload/c_')
    ) {
      return trimmed;
    }

    const format = options?.format || 'auto';
    const quality = options?.quality ?? 'auto';
    const widthParam = options?.width ? `,w_${options.width},c_limit` : '';
    const qualityParam = quality === 'auto' ? ',q_auto' : `,q_${quality}`;

    return trimmed.replace(
      '/image/upload/',
      `/image/upload/f_${format}${qualityParam}${widthParam}/`
    );
  }

  // Unsplash URLs
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(trimmed);
      if (!parsed.searchParams.has('auto')) parsed.searchParams.set('auto', 'format');
      if (!parsed.searchParams.has('fit')) parsed.searchParams.set('fit', 'crop');
      if (options?.width && !parsed.searchParams.has('w')) {
        parsed.searchParams.set('w', String(options.width));
      }
      if (!parsed.searchParams.has('q')) {
        parsed.searchParams.set('q', options?.quality && options.quality !== 'auto' ? String(options.quality) : '80');
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Lightweight neutral warm placeholder SVG data URI for smooth image progressive display.
 */
export const SHIMMER_BLUR_DATA_URL =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100%25" height="100%25" fill="%23FAF5F2"/%3E%3C/svg%3E';
