'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, Loader2, Phone, MessageCircle, Mail, MapPin, Clock, Megaphone } from 'lucide-react';
import { ContactInformation } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AdminContactPage() {
  const [contact, setContact] = useState<ContactInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [phone, setPhone] = useState('+91 79947 02567');
  const [whatsapp, setWhatsapp] = useState('917994702567');
  const [email, setEmail] = useState('support@tinygrow.com');
  const [address, setAddress] = useState('123 Baby Blossom Lane, Care City');
  const [businessHours, setBusinessHours] = useState('Mon - Sat, 9AM - 6PM');
  const [announcementText, setAnnouncementText] = useState('Free shipping on orders above ₹999 | Easy returns | Safe & secure payment');

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('contact_information')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          setErrorMsg(error.message);
        } else if (data) {
          const c = data as ContactInformation;
          setContact(c);
          setPhone(c.phone || '+91 79947 02567');
          setWhatsapp(c.whatsapp_number || '917994702567');
          setEmail(c.email || 'support@tinygrow.com');
          setAddress(c.address || '');
          setBusinessHours(c.business_hours || 'Mon - Sat, 9AM - 6PM');
          setAnnouncementText(c.announcement_text || 'Free shipping on orders above ₹999 | Easy returns | Safe & secure payment');
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Error fetching contact settings');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
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
      phone,
      whatsapp_number: whatsapp.replace(/[^0-9]/g, ''),
      email,
      address,
      business_hours: businessHours,
      announcement_text: announcementText,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      if (contact?.id) {
        const { error } = await supabase
          .from('contact_information')
          .update(payload)
          .eq('id', contact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_information')
          .insert(payload);
        if (error) throw error;
      }
      setSuccessMsg('Contact information and WhatsApp number updated successfully!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update contact info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl w-full">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
          Contact &amp; Storefront Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure the WhatsApp business phone number, support hotline, and announcement banner
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
        <div className="p-8 text-center text-slate-400 text-xs">Loading contact settings...</div>
      ) : (
        <form onSubmit={handleSave} className="my-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                WhatsApp Business Number * (For Direct Orders)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 917994702567 (Country code + digits)"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-9 border border-slate-200 focus:outline-none focus:border-[#25D366]"
                />
                <MessageCircle className="w-4 h-4 text-[#25D366] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                All &quot;Order on WhatsApp&quot; clicks will send pre-filled orders to this number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Support Helpline Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 79947 02567"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-9 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Support Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@tinygrow.com"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-9 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Business Hours
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  placeholder="Mon - Sat, 9AM - 6PM"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-9 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Physical / Return Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Baby Blossom Lane, Care City"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-9 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Top Announcement Bar Notice
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Free shipping on orders above ₹999 | Easy returns | Safe & secure payment"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 pl-9 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
                <Megaphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Contact &amp; WhatsApp Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
