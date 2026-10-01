'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, Check, Loader2, ExternalLink, Image as ImageIcon, Type, Link as LinkIcon, Sparkles } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AboutData {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  active: boolean;
}

interface PromoData {
  id?: string;
  card_key: string;
  title: string;
  subtitle: string;
  tagline: string;
  button_text: string;
  button_link: string;
  image_url: string;
  active: boolean;
}

// ─── Status Banner ────────────────────────────────────────────────────────────
function StatusBanner({ error, success }: { error: string | null; success: string | null }) {
  if (error) {
    return (
      <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span className="font-semibold">{success}</span>
      </div>
    );
  }
  return null;
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
// ─── Section Card Wrapper ─────────────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  badge,
  badgeColor,
  children,
  onSave,
  saving,
  saveLabel,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${badgeColor}`}>{badge}</span>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 truncate">{title}</h2>
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-all disabled:opacity-50 shadow-xs shrink-0 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving…' : 'Save'}</span>
          </button>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">{children}</div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:bg-white transition-all';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminBannersPage() {
  const router = useRouter();

  // View Mode: 'grid' (all 3 side-by-side) or individual tab
  const [viewMode, setViewMode] = useState<'grid' | 'about' | 'special_offers' | 'comfort_today'>('grid');

  // About / Tiny Essentials
  const [about, setAbout] = useState<AboutData>({
    title: 'Tiny Essentials for a Happier Tomorrow',
    description: '',
    image_url: '',
    button_text: 'Explore Now',
    button_link: '/shop',
    active: true,
  });
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [aboutSuccess, setAboutSuccess] = useState<string | null>(null);

  // Special Offers promo
  const [specialOffers, setSpecialOffers] = useState<PromoData>({
    card_key: 'special_offers',
    title: 'Special Offers',
    subtitle: 'For your little happiness',
    tagline: '',
    button_text: 'Shop Now',
    button_link: '/shop',
    image_url: '',
    active: true,
  });
  const [soSaving, setSoSaving] = useState(false);
  const [soError, setSoError] = useState<string | null>(null);
  const [soSuccess, setSoSuccess] = useState<string | null>(null);

  // Comfort Today promo
  const [comfort, setComfort] = useState<PromoData>({
    card_key: 'comfort_today',
    title: 'Comfort Today',
    subtitle: 'Ultra-soft daily wear essentials',
    tagline: 'Soft • Stylish • Safe',
    button_text: 'Explore',
    button_link: '/category/accessories',
    image_url: '',
    active: true,
  });
  const [ctSaving, setCtSaving] = useState(false);
  const [ctError, setCtError] = useState<string | null>(null);
  const [ctSuccess, setCtSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // ── Fetch all data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      if (!isSupabaseConfigured()) { setLoading(false); return; }
      const supabase = createClient();

      const [{ data: aboutData }, { data: promos }] = await Promise.all([
        supabase.from('about_section').select('*').limit(1).maybeSingle(),
        supabase.from('promotions').select('*'),
      ]);

      if (aboutData) {
        setAbout({
          id: aboutData.id,
          title: aboutData.title || 'Tiny Essentials for a Happier Tomorrow',
          description: aboutData.description || '',
          image_url: aboutData.image_url || '',
          button_text: aboutData.button_text || 'Explore Now',
          button_link: aboutData.button_link || '/shop',
          active: aboutData.active ?? true,
        });
      }

      if (promos) {
        const so = promos.find((p: PromoData) => p.card_key === 'special_offers');
        const ct = promos.find((p: PromoData) => p.card_key === 'comfort_today');
        if (so) setSpecialOffers((prev) => ({ ...prev, ...so, image_url: so.image_url || '' }));
        if (ct) setComfort((prev) => ({ ...prev, ...ct, image_url: ct.image_url || '' }));
      }

      setLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save Handlers ───────────────────────────────────────────────────────────
  const saveAbout = async () => {
    setAboutError(null); setAboutSuccess(null); setAboutSaving(true);
    if (!isSupabaseConfigured()) {
      setAboutError('Supabase is not configured in .env.local');
      setAboutSaving(false);
      return;
    }
    try {
      const supabase = createClient();
      const payload = {
        title: about.title,
        description: about.description.trim() || null,
        image_url: about.image_url.trim() || null,
        button_text: about.button_text,
        button_link: about.button_link,
        active: about.active,
        updated_at: new Date().toISOString(),
      };
      if (about.id) {
        const { data, error } = await supabase
          .from('about_section')
          .update(payload)
          .eq('id', about.id)
          .select();
        if (error) throw new Error(error.message);
        if (!data || data.length === 0) {
          throw new Error('Save was blocked by Supabase Row-Level Security (RLS). Please run the SQL in your Supabase SQL Editor.');
        }
      } else {
        const { data, error } = await supabase
          .from('about_section')
          .insert(payload)
          .select()
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (data) setAbout((p) => ({ ...p, id: data.id }));
      }
      setAboutSuccess('Tiny Essentials section saved successfully! Changes are live on your storefront.');
      router.refresh();
    } catch (e: unknown) {
      setAboutError(e instanceof Error ? e.message : 'Save failed. Check your Supabase tables and RLS policies.');
    } finally {
      setAboutSaving(false);
    }
  };

  const savePromo = async (
    promo: PromoData,
    setPromo: React.Dispatch<React.SetStateAction<PromoData>>,
    setErr: (v: string | null) => void,
    setOk: (v: string | null) => void,
    setSaving: (v: boolean) => void,
    label: string,
  ) => {
    setErr(null); setOk(null); setSaving(true);
    if (!isSupabaseConfigured()) {
      setErr('Supabase is not configured in .env.local');
      setSaving(false);
      return;
    }
    try {
      const supabase = createClient();
      const payload = {
        card_key: promo.card_key,
        title: promo.title,
        subtitle: promo.subtitle.trim() || null,
        tagline: promo.tagline.trim() || null,
        button_text: promo.button_text,
        button_link: promo.button_link,
        image_url: promo.image_url.trim() || null,
        active: promo.active,
        updated_at: new Date().toISOString(),
      };
      if (promo.id) {
        const { data, error } = await supabase
          .from('promotions')
          .update(payload)
          .eq('id', promo.id)
          .select();
        if (error) throw new Error(error.message);
        if (!data || data.length === 0) {
          throw new Error('Save was blocked by Supabase Row-Level Security (RLS). Please run the SQL in your Supabase SQL Editor.');
        }
      } else {
        const { data, error } = await supabase
          .from('promotions')
          .upsert(payload, { onConflict: 'card_key' })
          .select()
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (data) setPromo((p) => ({ ...p, id: data.id }));
      }
      setOk(`${label} saved successfully! Changes are live on your storefront.`);
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed. Check your Supabase tables and RLS policies.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading banner settings…
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-pink-500" />
            Homepage Banners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage the 3 promotional sections shown on your homepage. Edit and save them side-by-side.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 border border-sky-200 rounded-xl px-3.5 py-2 bg-sky-50 hover:bg-sky-100 transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Storefront
        </Link>
      </div>

      {/* View Switcher Tabs (Side-by-Side vs Focused View) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-100/70 p-1.5 sm:p-2 rounded-2xl border border-slate-200/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All 3 Side-by-Side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'about'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-purple-700 border border-slate-200/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>1. Tiny Essentials</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('special_offers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'special_offers'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-pink-700 border border-slate-200/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>2. Special Offers</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('comfort_today')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'comfort_today'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-sky-700 border border-slate-200/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>3. Comfort Today</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 hidden lg:block px-2">
          {viewMode === 'grid' ? 'Viewing 3 sections next to each other' : 'Viewing focused section'}
        </p>
      </div>

      {/* ── 3 Banner Options Grid ────────────────────────────────────────────── */}
      <div
        className={`grid gap-6 items-stretch ${
          viewMode === 'grid'
            ? 'grid-cols-1 lg:grid-cols-3'
            : 'grid-cols-1 max-w-2xl mx-auto'
        }`}
      >

        {/* ── Section 1: Tiny Essentials / About ─────────────────────────────── */}
        {(viewMode === 'grid' || viewMode === 'about') && (
          <SectionCard
            title="Tiny Essentials Banner"
            subtitle='Section 1 feature: "Tiny Essentials for a Happier Tomorrow"'
            badge="Section 1"
            badgeColor="bg-purple-100 text-purple-700"
            onSave={saveAbout}
            saving={aboutSaving}
            saveLabel="Save Tiny Essentials"
          >
            <div className="flex flex-col gap-4">
              <StatusBanner error={aboutError} success={aboutSuccess} />

              <Field label="Section Heading">
                <input
                  type="text"
                  value={about.title}
                  onChange={(e) => setAbout((p) => ({ ...p, title: e.target.value }))}
                  className={inputClass}
                  placeholder="Tiny Essentials for a Happier Tomorrow"
                  spellCheck={false}
                  data-gramm="false"
                  data-enable-grammarly="false"
                  autoComplete="off"
                />
              </Field>

              <Field label="Description / Tagline">
                <textarea
                  rows={3}
                  value={about.description}
                  onChange={(e) => setAbout((p) => ({ ...p, description: e.target.value }))}
                  className={inputClass}
                  placeholder="Every little detail crafted with love..."
                  spellCheck={false}
                  data-gramm="false"
                  data-enable-grammarly="false"
                  autoComplete="off"
                />
              </Field>

              <div>
                <ImageUploader
                  label="Feature Image"
                  value={about.image_url}
                  onChange={(url) => setAbout((p) => ({ ...p, image_url: url }))}
                  aspectRatio="aspect-video"
                  hint="Full background photo for the Tiny Essentials banner."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Button Text">
                  <div className="relative">
                    <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={about.button_text}
                      onChange={(e) => setAbout((p) => ({ ...p, button_text: e.target.value }))}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </Field>

                <Field label="Button Link">
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={about.button_link}
                      onChange={(e) => setAbout((p) => ({ ...p, button_link: e.target.value }))}
                      className={`${inputClass} pl-7`}
                      placeholder="/shop"
                    />
                  </div>
                </Field>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="aboutActive"
                  checked={about.active}
                  onChange={(e) => setAbout((p) => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="aboutActive" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Visible on storefront
                </label>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={saveAbout}
                disabled={aboutSaving}
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {aboutSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Tiny Essentials Banner</span>
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── Section 2: Special Offers ───────────────────────────────────────── */}
        {(viewMode === 'grid' || viewMode === 'special_offers') && (
          <SectionCard
            title="Special Offers Card"
            subtitle='Section 2 promo: Left pink themed card'
            badge="Section 2"
            badgeColor="bg-pink-100 text-pink-700"
            onSave={() =>
              savePromo(specialOffers, setSpecialOffers, setSoError, setSoSuccess, setSoSaving, 'Special Offers card')
            }
            saving={soSaving}
            saveLabel="Save Offers Card"
          >
            <div className="flex flex-col gap-4">
              <StatusBanner error={soError} success={soSuccess} />

              <Field label="Card Title">
                <input
                  type="text"
                  value={specialOffers.title}
                  onChange={(e) => setSpecialOffers((p) => ({ ...p, title: e.target.value }))}
                  className={inputClass}
                  placeholder="Special Offers"
                  spellCheck={false}
                  data-gramm="false"
                  data-enable-grammarly="false"
                  autoComplete="off"
                />
              </Field>

              <Field label="Subtitle">
                <input
                  type="text"
                  value={specialOffers.subtitle}
                  onChange={(e) => setSpecialOffers((p) => ({ ...p, subtitle: e.target.value }))}
                  className={inputClass}
                  placeholder="For your little happiness"
                  spellCheck={false}
                  data-gramm="false"
                  data-enable-grammarly="false"
                  autoComplete="off"
                />
              </Field>

              <div>
                <ImageUploader
                  label="Card Image"
                  value={specialOffers.image_url}
                  onChange={(url) => setSpecialOffers((p) => ({ ...p, image_url: url }))}
                  aspectRatio="aspect-square"
                  hint="Shows full on the left half of the card."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Button Text">
                  <div className="relative">
                    <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={specialOffers.button_text}
                      onChange={(e) => setSpecialOffers((p) => ({ ...p, button_text: e.target.value }))}
                      className={`${inputClass} pl-7`}
                      spellCheck={false}
                      data-gramm="false"
                      data-enable-grammarly="false"
                    />
                  </div>
                </Field>

                <Field label="Button Link">
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={specialOffers.button_link}
                      onChange={(e) => setSpecialOffers((p) => ({ ...p, button_link: e.target.value }))}
                      className={`${inputClass} pl-7`}
                      placeholder="/shop"
                      spellCheck={false}
                      data-gramm="false"
                      data-enable-grammarly="false"
                    />
                  </div>
                </Field>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="soActive"
                  checked={specialOffers.active}
                  onChange={(e) => setSpecialOffers((p) => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
                <label htmlFor="soActive" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Visible on storefront
                </label>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  savePromo(specialOffers, setSpecialOffers, setSoError, setSoSuccess, setSoSaving, 'Special Offers card')
                }
                disabled={soSaving}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {soSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Special Offers Card</span>
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── Section 3: Comfort Today ────────────────────────────────────────── */}
        {(viewMode === 'grid' || viewMode === 'comfort_today') && (
          <SectionCard
            title="Comfort Today Card"
            subtitle='Section 3 promo: Right blue themed card'
            badge="Section 3"
            badgeColor="bg-sky-100 text-sky-700"
            onSave={() =>
              savePromo(comfort, setComfort, setCtError, setCtSuccess, setCtSaving, 'Comfort Today card')
            }
            saving={ctSaving}
            saveLabel="Save Comfort Card"
          >
            <div className="flex flex-col gap-4">
              <StatusBanner error={ctError} success={ctSuccess} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Card Title">
                  <input
                    type="text"
                    value={comfort.title}
                    onChange={(e) => setComfort((p) => ({ ...p, title: e.target.value }))}
                    className={inputClass}
                    placeholder="Comfort Today"
                    spellCheck={false}
                    data-gramm="false"
                    data-enable-grammarly="false"
                    autoComplete="off"
                  />
                </Field>

                <Field label="Tagline (Blue text)">
                  <input
                    type="text"
                    value={comfort.tagline}
                    onChange={(e) => setComfort((p) => ({ ...p, tagline: e.target.value }))}
                    className={inputClass}
                    placeholder="Soft • Stylish • Safe"
                    spellCheck={false}
                    data-gramm="false"
                    data-enable-grammarly="false"
                    autoComplete="off"
                  />
                </Field>
              </div>

              <Field label="Subtitle">
                <input
                  type="text"
                  value={comfort.subtitle}
                  onChange={(e) => setComfort((p) => ({ ...p, subtitle: e.target.value }))}
                  className={inputClass}
                  placeholder="Ultra-soft daily wear essentials"
                  spellCheck={false}
                  data-gramm="false"
                  data-enable-grammarly="false"
                  autoComplete="off"
                />
              </Field>

              <div>
                <ImageUploader
                  label="Card Image"
                  value={comfort.image_url}
                  onChange={(url) => setComfort((p) => ({ ...p, image_url: url }))}
                  aspectRatio="aspect-square"
                  hint="Shows full on the right half of the card."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Button Text">
                  <div className="relative">
                    <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={comfort.button_text}
                      onChange={(e) => setComfort((p) => ({ ...p, button_text: e.target.value }))}
                      className={`${inputClass} pl-7`}
                      spellCheck={false}
                      data-gramm="false"
                      data-enable-grammarly="false"
                    />
                  </div>
                </Field>

                <Field label="Button Link">
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={comfort.button_link}
                      onChange={(e) => setComfort((p) => ({ ...p, button_link: e.target.value }))}
                      className={`${inputClass} pl-7`}
                      placeholder="/category/accessories"
                      spellCheck={false}
                      data-gramm="false"
                      data-enable-grammarly="false"
                    />
                  </div>
                </Field>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ctActive"
                  checked={comfort.active}
                  onChange={(e) => setComfort((p) => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
                <label htmlFor="ctActive" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Visible on storefront
                </label>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  savePromo(comfort, setComfort, setCtError, setCtSuccess, setCtSaving, 'Comfort Today card')
                }
                disabled={ctSaving}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {ctSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Comfort Today Card</span>
              </button>
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  );
}
