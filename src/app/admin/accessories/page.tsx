'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  X,
  Tag,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import { Product, Category, AGE_GROUP_OPTIONS } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import { deleteMediaUrls } from '@/lib/mediaUtils';

export default function AdminAccessoriesPage() {
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formMrp, setFormMrp] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSuitableAges, setFormSuitableAges] = useState<string[]>([]);
  const [formStockStatus, setFormStockStatus] = useState<'in_stock' | 'out_of_stock' | 'low_stock'>('in_stock');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setAccessories([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const [accRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(*)')
          .eq('is_accessory', true)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
      ]);

      if (accRes.error) throw accRes.error;
      if (catRes.error) throw catRes.error;

      const raw = (accRes.data as Product[]) || [];
      const normalized = raw.map((p) => {
        let mrp = p.mrp ? Number(p.mrp) : null;
        if (!mrp && p.description && p.description.includes('[MRP:')) {
          const m = p.description.match(/\[MRP:\s*([0-9.]+)\]/);
          if (m && m[1]) mrp = Number(m[1]);
        }
        return {
          ...p,
          price: Number(p.price) || 0,
          mrp: mrp && !isNaN(mrp) ? mrp : null,
        };
      });

      setAccessories(normalized);
      setCategories((catRes.data as Category[]) || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error fetching accessories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormCategoryId('');
    setFormPrice('');
    setFormMrp('');
    setFormDescription('');
    setFormImageUrl('');
    setFormSuitableAges([]);
    setFormStockStatus('in_stock');
    setFormFeatured(false);
    setFormNewArrival(false);
    setIsModalOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormCategoryId(p.category_id || '');
    setFormPrice(p.price);

    let mrpVal: number | '' = '';
    if (p.mrp) {
      mrpVal = Number(p.mrp);
    } else if (p.description && p.description.includes('[MRP:')) {
      const match = p.description.match(/\[MRP:\s*([0-9.]+)\]/);
      if (match && match[1]) mrpVal = Number(match[1]);
    }
    setFormMrp(mrpVal);

    const cleanDesc = (p.description || '').replace(/\s*\[MRP:\s*[0-9.]+\]/g, '').trim();
    setFormDescription(cleanDesc);
    setFormImageUrl(p.image_url || '');
    setFormSuitableAges(p.suitable_ages || []);
    setFormStockStatus(p.stock_status);
    setFormFeatured(p.featured);
    setFormNewArrival(p.is_new_arrival);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    if (!isSupabaseConfigured()) { setErrorMsg('Supabase not configured'); return; }

    const itemToDelete = accessories.find((p) => p.id === id);
    const imageUrl = itemToDelete?.image_url;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      if (imageUrl) {
        deleteMediaUrls([imageUrl]).catch((delErr) =>
          console.warn('Failed to delete image from Cloudinary:', delErr)
        );
      }

      addToast(`"${name}" deleted successfully!`, 'success');
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      setErrorMsg(msg);
      addToast(msg, 'error');
    }
  };

  const toggleAge = (age: string) => {
    setFormSuitableAges((prev) =>
      prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase credentials not configured in .env.local');
      setSaving(false);
      return;
    }

    const slug = formSlug.trim() || formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const mrpNumber = formMrp !== '' ? Number(formMrp) : null;
    const payload: Record<string, unknown> = {
      name: formName.trim(),
      slug,
      category_id: formCategoryId || null,
      price: Number(formPrice) || 0,
      mrp: mrpNumber,
      description: formDescription.trim() || null,
      image_url: formImageUrl.trim() || null,
      suitable_ages: formSuitableAges,
      stock_status: formStockStatus,
      featured: formFeatured,
      is_new_arrival: formNewArrival,
      is_toy: false,
      is_accessory: true,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      if (isEditing && editingId) {
        let { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId)
          .select();

        if (error && (error.message?.includes('mrp') || (error as { details?: string })?.details?.includes('mrp'))) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.mrp;
          if (mrpNumber) fallbackPayload.description = `${formDescription.trim() || ''} [MRP:${mrpNumber}]`.trim();
          const retryRes = await supabase.from('products').update(fallbackPayload).eq('id', editingId).select();
          if (!retryRes.error && retryRes.data) {
            data = retryRes.data;
            error = null;
          }
        }

        if (error) throw new Error(error.message);
        if (!data || data.length === 0)
          throw new Error('Update blocked by RLS. Run the SQL from supabase/schema.sql in your Supabase Dashboard → SQL Editor.');
        addToast(`"${formName}" updated successfully! ✓`, 'success');
      } else {
        let { data, error } = await supabase.from('products').insert(payload).select();

        if (error && (error.message?.includes('mrp') || (error as { details?: string })?.details?.includes('mrp'))) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.mrp;
          if (mrpNumber) fallbackPayload.description = `${formDescription.trim() || ''} [MRP:${mrpNumber}]`.trim();
          const retryRes = await supabase.from('products').insert(fallbackPayload).select();
          if (!retryRes.error && retryRes.data) {
            data = retryRes.data;
            error = null;
          }
        }

        if (error) throw new Error(error.message);
        if (!data || data.length === 0)
          throw new Error('Insert blocked by RLS. Run the SQL from supabase/schema.sql in your Supabase Dashboard → SQL Editor.');
        addToast(`"${formName}" added to accessories! ✓`, 'success');
      }

      resetForm();
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = accessories.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <Tag className="w-5 h-5" />
            </div>
            Accessories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage baby accessories — headbands, bibs, socks, bags, and more.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Shop
          </Link>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Accessory
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-700">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Search */}
      <div className="my-6 relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search accessories..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-violet-400 shadow-2xs"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <span className="text-xs font-medium">Loading accessories...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Tag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {searchQuery ? 'No accessories match your search' : 'No accessories added yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add Accessory&quot; to add headbands, bibs, socks, bags and more.
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-2 bg-violet-600 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Accessory
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group h-full"
            >
              <div>
                {/* Image */}
                <div className="relative w-full aspect-square rounded-xl bg-slate-100 overflow-hidden mb-3 border border-slate-100 flex items-center justify-center">
                  {a.image_url ? (
                    <Image
                      src={a.image_url}
                      alt={a.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <Tag className="w-8 h-8 text-violet-400" strokeWidth={1.5} />
                      <span className="text-[11px] font-semibold">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                      a.stock_status === 'in_stock' ? 'bg-emerald-500 text-white'
                      : a.stock_status === 'low_stock' ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                    }`}>
                      {a.stock_status === 'in_stock' ? 'In Stock' : a.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-2xs">
                      <Tag className="w-2.5 h-2.5" />
                      Accessory
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px] leading-snug" title={a.name}>
                    {a.name}
                  </h3>
                  <div className="flex flex-col items-end shrink-0 mt-0.5">
                    <span className="text-xs font-black text-[#0F172A]">₹{Number(a.price).toLocaleString()}</span>
                    {a.mrp && Number(a.mrp) > Number(a.price) && (
                      <span className="text-[10px] text-slate-400 line-through">₹{Number(a.mrp).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {a.categories?.name || 'Uncategorized'}
                  </span>
                  {a.is_new_arrival && (
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />New
                    </span>
                  )}
                </div>

                {a.suitable_ages && a.suitable_ages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.suitable_ages.slice(0, 2).map((age) => (
                      <span key={age} className="text-[9px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                        {age}
                      </span>
                    ))}
                    {a.suitable_ages.length > 2 && (
                      <span className="text-[9px] text-slate-400">+{a.suitable_ages.length - 2}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-1.5 pt-3 mt-3 border-t border-slate-100">
                <Link
                  href={`/product/${a.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0284C7] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Store
                </Link>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(a)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#0284C7] bg-slate-50 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200/80"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id, a.name)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {isEditing ? `Edit: ${formName}` : 'Add New Accessory'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  This item will be tagged as an Accessory and appear in the accessories section.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Info */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        if (!isEditing) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }}
                      placeholder="e.g. Soft Cotton Headband"
                      className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-violet-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="e.g. soft-cotton-headband"
                      className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-violet-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                      <select
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-violet-400"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Status</label>
                      <select
                        value={formStockStatus}
                        onChange={(e) => setFormStockStatus(e.target.value as 'in_stock' | 'out_of_stock' | 'low_stock')}
                        className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-violet-400"
                      >
                        <option value="in_stock">In Stock (Available)</option>
                        <option value="low_stock">Low Stock (Hurry)</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Selling Price (₹) * <span className="text-[10px] text-emerald-600 font-semibold normal-case">(Actual Price)</span>
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 199"
                        className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-violet-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        MRP Price (₹) <span className="text-[10px] text-slate-400 font-semibold normal-case">(Strike Price)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formMrp}
                        onChange={(e) => setFormMrp(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 299 (shown as strike)"
                        className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-violet-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Soft stretchy headband for newborns and toddlers..."
                      className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>

                {/* Right: Photo & Options */}
                <div className="flex flex-col gap-4">
                  <ImageUploader
                    label="Accessory Photo"
                    value={formImageUrl}
                    onChange={setFormImageUrl}
                    aspectRatio="aspect-square"
                    hint="Upload a clear photo of the accessory."
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Suitable Age Groups</label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                      {AGE_GROUP_OPTIONS.map((age) => {
                        const isSelected = formSuitableAges.includes(age);
                        return (
                          <button
                            key={age}
                            type="button"
                            onClick={() => toggleAge(age)}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-violet-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                            <span>{age}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formNewArrival}
                        onChange={(e) => setFormNewArrival(e.target.checked)}
                        className="w-4 h-4 rounded accent-violet-600"
                      />
                      <span className="text-xs font-bold text-slate-700">Mark as New Arrival</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 rounded accent-violet-600"
                      />
                      <span className="text-xs font-bold text-slate-700">Featured Product</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isEditing ? 'Save Changes' : 'Add Accessory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
