'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, Loader2 } from 'lucide-react';
import { AboutSection } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminAboutPage() {
  const [about, setAbout] = useState<AboutSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('Tiny Essentials for a Happier Tomorrow');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Explore Now');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [active, setActive] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      setLoading(true);
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('about_section')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          setErrorMsg(error.message);
        } else if (data) {
          const a = data as AboutSection;
          setAbout(a);
          setTitle(a.title || 'Tiny Essentials for a Happier Tomorrow');
          setDescription(a.description || '');
          setImageUrl(a.image_url || '');
          setButtonText(a.button_text || 'Explore Now');
          setButtonLink(a.button_link || '/shop');
          setActive(a.active);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Error fetching about section');
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSaving(true);

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase is not configured in .env.local');
      setSaving(false);
      return;
    }

    const payload = {
      title,
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      button_text: buttonText,
      button_link: buttonLink,
      active,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      if (about?.id) {
        const { error } = await supabase
          .from('about_section')
          .update(payload)
          .eq('id', about.id);
        if (error) {
          throw new Error(error.message || error.details || 'Failed to update about section');
        }
      } else {
        const { data, error } = await supabase
          .from('about_section')
          .insert(payload)
          .select()
          .maybeSingle();
        if (error) {
          throw new Error(error.message || error.details || 'Failed to insert about section');
        }
        if (data) {
          setAbout(data as AboutSection);
        }
      }
      setSuccessMsg('Tiny Essentials & About section updated successfully!');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to update about section';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl w-full">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
          Manage Tiny Essentials &amp; About
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize the prominent &quot;Tiny Essentials for a Happier Tomorrow&quot; banner section
        </p>
      </div>

      {errorMsg && (
        <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading section settings...</div>
      ) : (
        <form onSubmit={handleSave} className="my-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Section Heading
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description / Tagline
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comfortable, skin-friendly and safe baby apparel..."
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                label="Banner Feature Image"
                value={imageUrl}
                onChange={setImageUrl}
                aspectRatio="aspect-video"
                hint="Feature banner image for the brand story section."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Button Link
              </label>
              <input
                type="text"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="aboutActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-[#FB7185] rounded"
            />
            <label htmlFor="aboutActive" className="text-xs font-semibold text-slate-700">
              Active / Visible on storefront
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Section</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
