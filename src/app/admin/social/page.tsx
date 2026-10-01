'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, Loader2 } from 'lucide-react';
import { InstagramIcon, FacebookIcon, PinterestIcon, YoutubeIcon } from '@/components/SocialIcons';
import { SocialLink } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AdminSocialPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [pinterest, setPinterest] = useState('');
  const [youtube, setYoutube] = useState('');

  const fetchSocials = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('social_links').select('*');

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        const links = data as SocialLink[];
        links.forEach((l) => {
          const platform = l.platform.toLowerCase();
          if (platform === 'instagram') setInstagram(l.url);
          else if (platform === 'facebook') setFacebook(l.url);
          else if (platform === 'pinterest') setPinterest(l.url);
          else if (platform === 'youtube') setYoutube(l.url);
        });
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error fetching social links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
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

    try {
      const supabase = createClient();
      const platforms = [
        { platform: 'instagram', url: instagram.trim(), display_order: 1 },
        { platform: 'facebook', url: facebook.trim(), display_order: 2 },
        { platform: 'pinterest', url: pinterest.trim(), display_order: 3 },
        { platform: 'youtube', url: youtube.trim(), display_order: 4 },
      ].filter((p) => Boolean(p.url));

      // Upsert or clear and insert active links
      await supabase.from('social_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (platforms.length > 0) {
        const { error } = await supabase.from('social_links').insert(
          platforms.map((p) => ({
            platform: p.platform,
            url: p.url,
            active: true,
            display_order: p.display_order,
          }))
        );
        if (error) throw error;
      }

      setSuccessMsg('Social media links saved successfully!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save social links');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl w-full">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
          Social Media Links
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure external social profiles displayed in the footer
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
        <div className="p-8 text-center text-slate-400 text-xs">Loading social links...</div>
      ) : (
        <form onSubmit={handleSave} className="my-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Instagram Profile URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/tinygrow"
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-10 border border-slate-200 focus:outline-none focus:border-[#FB7185]"
              />
              <InstagramIcon className="w-4 h-4 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Facebook Page URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/tinygrow"
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-10 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
              />
              <FacebookIcon className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pinterest Profile URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={pinterest}
                onChange={(e) => setPinterest(e.target.value)}
                placeholder="https://pinterest.com/tinygrow"
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-10 border border-slate-200 focus:outline-none focus:border-red-400"
              />
              <span className="text-red-500 font-bold text-xs absolute left-3.5 top-1/2 -translate-y-1/2">P</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              YouTube Channel URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@tinygrow"
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-10 border border-slate-200 focus:outline-none focus:border-red-500"
              />
              <YoutubeIcon className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Social Links</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
