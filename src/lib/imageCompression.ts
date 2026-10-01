/**
 * Client-side image compression utility using HTML5 Canvas.
 * Automatically resizes large camera/phone photos to optimal e-commerce dimensions
 * and converts them to high-efficiency WebP (or JPEG fallback) at 82% quality.
 * Reduces raw 5-15 MB photos down to ~120-250 KB (90-95%+ storage savings for Cloudinary).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0 (default 0.82)
  targetFormat?: 'image/webp' | 'image/jpeg';
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  wasCompressed: boolean;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  // If not an image, or is an animated GIF or vector SVG, do not compress
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercentage: 0,
      wasCompressed: false,
    };
  }

  const maxWidth = options.maxWidth || 1600;
  const maxHeight = options.maxHeight || 1600;
  const quality = options.quality ?? 0.82;
  const targetFormat = options.targetFormat || 'image/webp';

  return new Promise((resolve) => {
    // Check if browser supports Image & Canvas
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercentage: 0,
        wasCompressed: false,
      });
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio while bounding within maxWidth & maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            reductionPercentage: 0,
            wasCompressed: false,
          });
        }

        // Draw image onto canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                originalSize: file.size,
                compressedSize: file.size,
                reductionPercentage: 0,
                wasCompressed: false,
              });
            }

            // Only use compressed blob if it actually reduced the size, or if it scaled down dimensionally
            if (blob.size < file.size || width < (img.naturalWidth || img.width)) {
              const extension = targetFormat === 'image/webp' ? 'webp' : 'jpg';
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}.${extension}`, {
                type: targetFormat,
                lastModified: Date.now(),
              });

              const reduction = Math.round(
                ((file.size - blob.size) / file.size) * 100
              );

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                reductionPercentage: Math.max(0, reduction),
                wasCompressed: true,
              });
            } else {
              // Original file was already smaller
              resolve({
                file,
                originalSize: file.size,
                compressedSize: file.size,
                reductionPercentage: 0,
                wasCompressed: false,
              });
            }
          },
          targetFormat,
          quality
        );
      };

      img.onerror = () => {
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          reductionPercentage: 0,
          wasCompressed: false,
        });
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercentage: 0,
        wasCompressed: false,
      });
    };

    reader.readAsDataURL(file);
  });
}
