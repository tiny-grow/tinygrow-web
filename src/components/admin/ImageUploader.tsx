'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Link2, X, Loader2, ImageIcon, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { compressImage } from '@/lib/imageCompression';
import { deleteMediaUrls } from '@/lib/mediaUtils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: string; // e.g. "aspect-square", "aspect-video"
  hint?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
  aspectRatio = 'aspect-video',
  hint,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('Uploading photo...');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync urlInput when parent changes `value`
  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, WebP, etc.)');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('Image must be smaller than 20MB');
        return;
      }

      setError(null);
      setSuccess(null);
      setUploading(true);
      setUploadStatus('Compressing photo for storage optimization...');

      try {
        // Compress image before upload (converts high-res camera photos to WebP < 250KB)
        const compression = await compressImage(file, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.82,
        });

        const fileToUpload = compression.file;
        const origSizeKb = (compression.originalSize / 1024).toFixed(0);
        const compSizeKb = (compression.compressedSize / 1024).toFixed(0);

        if (compression.wasCompressed && compression.reductionPercentage > 0) {
          setUploadStatus(`Uploading compressed photo (${origSizeKb} KB → ${compSizeKb} KB, -${compression.reductionPercentage}%)...`);
        } else {
          setUploadStatus('Uploading photo to Cloudinary...');
        }

        const headers: Record<string, string> = {};
        if (isSupabaseConfigured()) {
          try {
            const supabase = createClient();
            const { data } = await supabase.auth.getSession();
            if (data.session?.access_token) {
              headers['Authorization'] = `Bearer ${data.session.access_token}`;
            }
          } catch {
            // Continue
          }
        }

        const fd = new FormData();
        fd.append('file', fileToUpload);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: fd,
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Upload failed');
        }

        onChange(data.url);
        setUrlInput(data.url);
        if (compression.wasCompressed && compression.reductionPercentage > 0) {
          setSuccess(`Photo compressed & saved to Cloudinary! (${origSizeKb} KB → ${compSizeKb} KB, saved ${compression.reductionPercentage}%)`);
        } else {
          setSuccess('Photo uploaded to Cloudinary successfully!');
        }
        setTimeout(() => setSuccess(null), 4000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Upload failed. Try using a URL instead.');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    onChange(val.trim());
    setError(null);
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        {value && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Image attached
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFilePick}
      />

      {/* When image already exists: Show a clean preview card with Replace / Remove */}
      {value ? (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex flex-col xl:flex-row items-center gap-3.5 transition-all">
          <div className="relative w-full xl:w-32 h-32 xl:h-24 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              unoptimized
              className="object-cover"
              onError={() => setError('Failed to load image from preview link')}
            />
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg w-fit mb-1 border border-emerald-300">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Photo Attached (Click &quot;Save&quot; in this card to publish live)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-full">
              {value}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FB7185]" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* When NO image is selected: Show Drag & Drop + URL Tabs */
        <div className="flex flex-col gap-2">
          {/* Tab selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                tab === 'upload'
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse / Drag & Drop</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                tab === 'url'
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Paste Image Link</span>
            </button>
          </div>

          {tab === 'upload' ? (
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                dragOver
                  ? 'border-[#FB7185] bg-pink-50/70 scale-[0.99]'
                  : 'border-slate-200 bg-slate-50/80 hover:border-[#38BDF8] hover:bg-sky-50/40'
              } ${aspectRatio} flex flex-col items-center justify-center p-6 text-center`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#FB7185] animate-spin" />
                  <p className="text-xs font-bold text-slate-700">{uploadStatus}</p>
                  <p className="text-[11px] text-slate-400">Compressing & optimizing for fast loading</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#FB7185] shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to browse or drag & drop photo here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Auto-compressed to WebP (saves ~95% Cloudinary storage)
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://..."
                spellCheck={false}
                data-gramm="false"
                data-enable-grammarly="false"
                autoComplete="off"
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl py-2.5 px-4 border border-slate-200 focus:outline-none focus:border-[#38BDF8] focus:bg-white transition-all font-mono"
              />
            </div>
          )}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1.5">
          <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 shrink-0" />
          <span>{success}</span>
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
