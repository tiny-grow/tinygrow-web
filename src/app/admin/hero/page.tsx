'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, AlertCircle, Check, Loader2, ExternalLink, Monitor, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { HeroBanner } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminHeroPage() {
  const [hero, setHero] = useState<HeroBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [badgeText, setBadgeText] = useState('NEW ARRIVALS');
  const [title, setTitle] = useState('Little Moments, Made to Grow');
  const [titleHighlight, setTitleHighlight] = useState('Made to Grow');
  const [subtitle, setSubtitle] = useState('Soft clothing, little accessories and joyful toys for your little ones.');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Shop New Arrivals');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [feature1, setFeature1] = useState('Soft & Safe Materials');
  const [feature2, setFeature2] = useState("Gentle on Baby's Skin");
  const [feature3, setFeature3] = useState('Fast & Reliable Delivery');
  const [feature4, setFeature4] = useState('Trusted by Parents');
  const [active, setActive] = useState(true);
  const [mobileBanners, setMobileBanners] = useState<string[]>([]);

  useEffect(() => {
    const fetchHero = async () => {
      setLoading(true);
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('hero_banner')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          setErrorMsg(error.message);
        } else if (data) {
          const h = data as HeroBanner;
          setHero(h);
          setBadgeText(h.badge_text || 'NEW ARRIVALS');
          setTitle(h.title || 'Little Moments, Made to Grow');
          setTitleHighlight(h.title_highlight || 'Made to Grow');
          setSubtitle(h.subtitle || '');
          setImageUrl(h.image_url || '');
          const urls = Array.isArray(h.mobile_banner_urls) && h.mobile_banner_urls.length > 0
            ? h.mobile_banner_urls
            : h.mobile_image_url
            ? [h.mobile_image_url]
            : [];
          setMobileBanners(urls.slice(0, 3));
          setButtonText(h.button_text || 'Shop New Arrivals');
          setButtonLink(h.button_link || '/shop');
          setFeature1(h.feature_1_title || 'Soft & Safe Materials');
          setFeature2(h.feature_2_title || "Gentle on Baby's Skin");
          setFeature3(h.feature_3_title || 'Fast & Reliable Delivery');
          setFeature4(h.feature_4_title || 'Trusted by Parents');
          setActive(h.active);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Error fetching hero');
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  const handleMobileBannerChange = (index: number, url: string) => {
    setMobileBanners((prev) => {
      const updated = [...prev];
      updated[index] = url;
      return updated.slice(0, 3);
    });
  };

  const handleAddMobileBanner = () => {
    if (mobileBanners.length < 3) {
      setMobileBanners((prev) => [...prev, '']);
    }
  };

  const handleRemoveMobileBanner = (index: number) => {
    setMobileBanners((prev) => prev.filter((_, i) => i !== index));
  };

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

    const cleanMobileUrls = mobileBanners
      .map((url) => (url || '').trim())
      .filter(Boolean)
      .slice(0, 3);
    const primaryMobileUrl = cleanMobileUrls[0] || null;

    const payload: Record<string, unknown> = {
      badge_text: badgeText,
      title,
      title_highlight: titleHighlight,
      subtitle,
      image_url: imageUrl.trim() || null,
      mobile_image_url: primaryMobileUrl,
      mobile_banner_urls: cleanMobileUrls,
      button_text: buttonText,
      button_link: buttonLink,
      feature_1_title: feature1,
      feature_2_title: feature2,
      feature_3_title: feature3,
      feature_4_title: feature4,
      active,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      if (hero?.id) {
        let { data, error } = await supabase
          .from('hero_banner')
          .update(payload)
          .eq('id', hero.id)
          .select();

        // Graceful fallback if mobile columns are not yet migrated in remote Supabase
        if (error && (error.message?.includes('mobile_') || (error as { details?: string })?.details?.includes('mobile_'))) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.mobile_image_url;
          delete fallbackPayload.mobile_banner_urls;
          const retryRes = await supabase
            .from('hero_banner')
            .update(fallbackPayload)
            .eq('id', hero.id)
            .select();
          if (!retryRes.error) {
            setSuccessMsg('Hero banner updated! (Run the SQL in supabase/schema.sql in your Supabase dashboard to enable mobile banners permanently).');
            return;
          }
        }

        if (error) {
          throw new Error(error.message || error.details || 'Failed to update hero banner');
        }
        if (!data || data.length === 0) {
          throw new Error(
            'Database update was blocked by Supabase Row-Level Security (RLS). Please paste and run the SQL from supabase/schema.sql in your Supabase Dashboard -> SQL Editor.'
          );
        }
      } else {
        let { data, error } = await supabase
          .from('hero_banner')
          .insert(payload)
          .select()
          .maybeSingle();

        // Graceful fallback for insert if mobile columns are not yet in remote DB
        if (error && (error.message?.includes('mobile_') || (error as { details?: string })?.details?.includes('mobile_'))) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.mobile_image_url;
          delete fallbackPayload.mobile_banner_urls;
          const retryRes = await supabase
            .from('hero_banner')
            .insert(fallbackPayload)
            .select()
            .maybeSingle();
          if (!retryRes.error) {
            if (retryRes.data) setHero(retryRes.data as HeroBanner);
            setSuccessMsg('Hero banner created! (Run the SQL in supabase/schema.sql in your Supabase dashboard to enable mobile banners permanently).');
            return;
          }
        }

        if (error) {
          throw new Error(error.message || error.details || 'Failed to insert hero banner');
        }
        if (data) {
          setHero(data as HeroBanner);
        }
      }
      setSuccessMsg('Hero banner updated successfully!');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to update hero banner';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl w-full">
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Manage Hero Banner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize the main banner image, headline text, and buttons on your homepage
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2 rounded-xl transition-colors w-fit"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Homepage</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="my-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 underline text-xs shrink-0"
          >
            <span>See live banner on store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading Hero settings...</div>
      ) : (
        <form onSubmit={handleSave} className="my-6 flex flex-col gap-6">
          {/* Box 1: Text & Content Settings */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                Hero Content &amp; Headlines
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure your main announcement badge, titles, subtitle, and call-to-action button
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pink Highlight Phrase
                </label>
                <input
                  type="text"
                  value={titleHighlight}
                  onChange={(e) => setTitleHighlight(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
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
          </div>

          {/* Side-by-Side Banners: Desktop Banner & Mobile Banner Next to Each Other */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Box 2: Desktop View Banner (Dedicated Separate Box) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-sky-600" />
                      <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                        Desktop Hero Banner
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0284C7] border border-sky-100">
                        Desktop View
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Wide panoramic image displayed on desktop &amp; laptop screens
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <ImageUploader
                    label="Desktop Banner Image"
                    value={imageUrl}
                    onChange={setImageUrl}
                    aspectRatio="aspect-video"
                    hint="Recommended: panoramic wide photo (approx. 1920×700px or 16:9) with subject on the right side."
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Mobile View Banners (Dedicated Separate Box) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-pink-500" />
                      <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                        Mobile View Banners
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#FB7185] border border-pink-100">
                        {mobileBanners.length}/3 Added
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Portrait banners tailored for smartphones (up to 3 maximum)
                    </p>
                  </div>

                  {mobileBanners.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddMobileBanner}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FB7185] bg-pink-50 hover:bg-pink-100 border border-pink-200 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <span>+ Add Banner</span>
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  {mobileBanners.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center flex flex-col items-center justify-center min-h-[220px]">
                      <p className="text-xs text-slate-600 font-semibold">No mobile banners added yet.</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        By default, mobile screens adapt the desktop banner. Click below to add vertical banners for mobile devices.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddMobileBanner}
                        className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#FB7185] hover:bg-[#F43F5E] px-4 py-2 rounded-xl transition-all shadow-xs"
                      >
                        <span>+ Add First Mobile Banner</span>
                      </button>
                    </div>
                  ) : (
                    <div className={`grid gap-3 ${mobileBanners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {mobileBanners.map((url, index) => (
                        <div
                          key={index}
                          className="relative bg-slate-50/90 rounded-2xl p-3 border border-slate-200 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                            <span className="text-[11px] font-bold text-slate-800">
                              Banner {index + 1} {index === 0 ? '(Primary)' : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMobileBanner(index)}
                              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <ImageUploader
                            label={`Mobile Banner ${index + 1}`}
                            value={url}
                            onChange={(newUrl) => handleMobileBannerChange(index, newUrl)}
                            aspectRatio="aspect-[4/5]"
                            hint="Portrait: 1080×1350px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Box 4: 4 Feature Bullet Items */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                Hero Feature Bullet Items (4 Pillars)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The 4 trust pillars displayed at the bottom of the hero banner
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Feature 1</label>
                <input
                  type="text"
                  value={feature1}
                  onChange={(e) => setFeature1(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2 border border-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Feature 2</label>
                <input
                  type="text"
                  value={feature2}
                  onChange={(e) => setFeature2(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2 border border-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Feature 3</label>
                <input
                  type="text"
                  value={feature3}
                  onChange={(e) => setFeature3(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2 border border-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Feature 4</label>
                <input
                  type="text"
                  value={feature4}
                  onChange={(e) => setFeature4(e.target.value)}
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2 border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Box 5: Visibility & Save Action */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="heroActive"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#FB7185] rounded accent-[#FB7185] shrink-0"
              />
              <div>
                <label htmlFor="heroActive" className="text-xs font-bold text-slate-800 cursor-pointer block">
                  Show Hero Banner on Storefront
                </label>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  {active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Banner is visible to visitors on your homepage.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Banner is hidden — check this box to show it on your homepage.</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Hero Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
