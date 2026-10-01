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
  ShoppingBag,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Product, Category, AGE_GROUP_OPTIONS } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';
import { ToastContainer, useToast } from '@/components/admin/Toast';

const DRESS_TYPES = [
  'Casual Dresses',
  'Traditional Wear',
  'Party Wear',
  'Romper Dresses',
  'Frock Dresses',
];

export default function AdminDressesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDressType, setFormDressType] = useState('Casual Dresses');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formMrp, setFormMrp] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSuitableAges, setFormSuitableAges] = useState<string[]>([]);
  const [formStockStatus, setFormStockStatus] = useState<'in_stock' | 'out_of_stock' | 'low_stock'>('in_stock');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      // ONLY fetch dresses: exclude toys and accessories
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(*)')
          .eq('is_toy', false)
          .eq('is_accessory', false)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      const rawProducts = (prodRes.data as Product[]) || [];
      // Normalize MRP if present or extracted from description fallback
      const normalized = rawProducts.map((p) => {
        let mrp = p.mrp ? Number(p.mrp) : null;
        if (!mrp && p.description && p.description.includes('[MRP:')) {
          const match = p.description.match(/\[MRP:\s*([0-9.]+)\]/);
          if (match && match[1]) {
            mrp = Number(match[1]);
          }
        }
        return {
          ...p,
          price: Number(p.price) || 0,
          mrp: mrp && !isNaN(mrp) ? mrp : null,
        };
      });

      setProducts(normalized);
      setCategories((catRes.data as Category[]) || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error fetching dresses');
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
    setFormDressType('Casual Dresses');
    setFormPrice('');
    setFormMrp('');
    setFormDescription('');
    setFormImageUrl('');
    setFormSuitableAges([]);
    setFormStockStatus('in_stock');
    setFormFeatured(false);
    setFormNewArrival(true);
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

    // Extract or infer Dress Type
    let initialType = 'Casual Dresses';
    if (p.description && p.description.includes('[STYLE:')) {
      const match = p.description.match(/\[STYLE:\s*([^\]]+)\]/i);
      if (match && match[1]) initialType = match[1].trim();
    } else if (p.categories?.name) {
      const cName = p.categories.name.toLowerCase();
      if (cName.includes('traditional')) initialType = 'Traditional Wear';
      else if (cName.includes('casual')) initialType = 'Casual Dresses';
      else if (cName.includes('party')) initialType = 'Party Wear';
      else if (cName.includes('romper')) initialType = 'Romper Dresses';
      else if (cName.includes('frock')) initialType = 'Frock Dresses';
    } else if (p.name) {
      const n = p.name.toLowerCase();
      if (n.includes('traditional') || n.includes('kasavu')) initialType = 'Traditional Wear';
      else if (n.includes('casual')) initialType = 'Casual Dresses';
      else if (n.includes('party')) initialType = 'Party Wear';
      else if (n.includes('romper')) initialType = 'Romper Dresses';
      else if (n.includes('frock')) initialType = 'Frock Dresses';
    }
    setFormDressType(initialType);

    setFormPrice(p.price);

    let mrpVal: number | '' = '';
    if (p.mrp) {
      mrpVal = Number(p.mrp);
    } else if (p.description && p.description.includes('[MRP:')) {
      const match = p.description.match(/\[MRP:\s*([0-9.]+)\]/);
      if (match && match[1]) mrpVal = Number(match[1]);
    }
    setFormMrp(mrpVal);

    // Clean up internal [MRP:xxx] and [STYLE:xxx] tags from editable description field
    const cleanDesc = (p.description || '')
      .replace(/\s*\[MRP:\s*[0-9.]+\]/gi, '')
      .replace(/\s*\[STYLE:\s*[^\]]+\]/gi, '')
      .trim();
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

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase not configured in .env.local');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        setErrorMsg(error.message);
        addToast(error.message, 'error');
      } else {
        addToast(`Dress "${name}" deleted successfully!`, 'success');
        fetchData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete dress';
      setErrorMsg(msg);
      addToast(msg, 'error');
    }
  };

  const toggleAge = (age: string) => {
    if (formSuitableAges.includes(age)) {
      setFormSuitableAges(formSuitableAges.filter((a) => a !== age));
    } else {
      setFormSuitableAges([...formSuitableAges, age]);
    }
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

    const cleanDesc = formDescription
      .replace(/\s*\[MRP:\s*[0-9.]+\]/gi, '')
      .replace(/\s*\[STYLE:\s*[^\]]+\]/gi, '')
      .trim();

    let fullDesc = cleanDesc;
    if (formDressType) {
      fullDesc = `${fullDesc} [STYLE:${formDressType}]`.trim();
    }

    const payload: Record<string, unknown> = {
      name: formName.trim(),
      slug,
      category_id: formCategoryId ? formCategoryId : null,
      price: Number(formPrice) || 0,
      mrp: mrpNumber,
      description: fullDesc || null,
      image_url: formImageUrl.trim() || null,
      suitable_ages: formSuitableAges,
      stock_status: formStockStatus,
      featured: formFeatured,
      is_new_arrival: formNewArrival,
      is_toy: false,
      is_accessory: false,
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

        // Graceful fallback if remote DB doesn't have mrp column yet
        if (error && (error.message?.includes('mrp') || (error as { details?: string })?.details?.includes('mrp'))) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.mrp;
          if (mrpNumber) {
            fallbackPayload.description = `${fullDesc} [MRP:${mrpNumber}]`.trim();
          }
          const retryRes = await supabase
            .from('products')
            .update(fallbackPayload)
            .eq('id', editingId)
            .select();
          if (!retryRes.error && retryRes.data) {
            data = retryRes.data;
            error = null;
          }
        }

        if (error) {
          throw new Error(error.message || (error as { details?: string })?.details || 'Failed to update dress');
        }
        if (!data || data.length === 0) {
          throw new Error(
            'Database update was blocked by Supabase Row-Level Security (RLS). Please paste and run the SQL from supabase/schema.sql in your Supabase Dashboard -> SQL Editor.'
          );
        }
        addToast(`Dress "${formName}" updated successfully! ✓`, 'success');
      } else {
        let { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select();

        // Graceful fallback if remote DB doesn't have mrp column yet
        if (error && (error.message?.includes('mrp') || (error as { details?: string })?.details?.includes('mrp'))) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.mrp;
          if (mrpNumber) {
            fallbackPayload.description = `${fullDesc} [MRP:${mrpNumber}]`.trim();
          }
          const retryRes = await supabase
            .from('products')
            .insert(fallbackPayload)
            .select();
          if (!retryRes.error && retryRes.data) {
            data = retryRes.data;
            error = null;
          }
        }

        if (error) {
          throw new Error(error.message || (error as { details?: string })?.details || 'Failed to create dress');
        }
        if (!data || data.length === 0) {
          throw new Error(
            'Database insert was blocked by Supabase Row-Level Security (RLS). Please paste and run the SQL from supabase/schema.sql in your Supabase Dashboard -> SQL Editor.'
          );
        }
        addToast(`Dress "${formName}" added successfully! ✓`, 'success');
      }

      resetForm();
      fetchData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Operation failed';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    let matchesSearch = true;
    if (q) {
      const qWords = q.split(/\s+/).filter(Boolean);
      const name = p.name?.toLowerCase() || '';
      const slug = p.slug?.toLowerCase() || '';
      const desc = p.description?.toLowerCase() || '';
      const catName = p.categories?.name?.toLowerCase() || '';
      const fullText = `${name} ${slug} ${desc} ${catName}`;
      matchesSearch = qWords.every((w) => fullText.includes(w));
    }
    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-[#FB7185]" />
            <span>Manage Dresses</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, edit and organize baby dresses, frocks, onesies and clothing items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/category/dresses"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Dresses Page</span>
          </Link>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Dress</span>
          </button>
        </div>
      </div>

      {/* Inline error (for critical failures only) */}
      {errorMsg && (
        <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-700">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="p-1 hover:text-rose-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Search & Filter Toolbar */}
      <div className="my-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dresses by title or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#38BDF8] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>


      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FB7185] animate-spin" />
          <span className="text-xs font-medium">Loading dresses...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-[#FB7185]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {searchQuery || categoryFilter !== 'all'
                ? 'No dresses match your search or filter'
                : 'No dresses in your store yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add New Dress&quot; to create your first baby dress, frock or onesie.
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-2 bg-[#FB7185] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Dress</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group h-full"
            >
              <div>
                {/* Product Image Header */}
                <div className="relative w-full aspect-square rounded-xl bg-slate-100 overflow-hidden mb-3 border border-slate-100 flex items-center justify-center">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <ShoppingBag className="w-8 h-8 text-pink-400" strokeWidth={1.5} />
                      <span className="text-[11px] font-semibold">No image</span>
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                        p.stock_status === 'in_stock'
                          ? 'bg-emerald-500 text-white'
                          : p.stock_status === 'low_stock'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {p.stock_status === 'in_stock'
                        ? 'In Stock'
                        : p.stock_status === 'low_stock'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#FB7185] transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px] leading-snug" title={p.name}>
                    {p.name}
                  </h3>
                  <div className="flex flex-col items-end shrink-0 mt-0.5">
                    <span className="text-xs font-black text-[#0F172A]">
                      ₹{Number(p.price).toLocaleString()}
                    </span>
                    {p.mrp && Number(p.mrp) > Number(p.price) && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{Number(p.mrp).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {p.categories?.name || 'Dresses'}
                  </span>
                  {p.is_new_arrival && (
                    <span className="text-[10px] font-bold text-[#FB7185] bg-pink-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>New</span>
                    </span>
                  )}
                </div>

                {/* Suitable Ages */}
                {p.suitable_ages && p.suitable_ages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.suitable_ages.slice(0, 2).map((age) => (
                      <span key={age} className="text-[9px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                        {age}
                      </span>
                    ))}
                    {p.suitable_ages.length > 2 && (
                      <span className="text-[9px] text-slate-400">+{p.suitable_ages.length - 2}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-1.5 pt-3 mt-3 border-t border-slate-100">
                <Link
                  href={`/product/${p.slug}`}
                  target="_blank"
                  className="p-1.5 text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition-colors"
                  title="View on store"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit dress"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete dress"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dress Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                  {isEditing ? 'Edit Dress' : 'Add New Dress'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in the dress details, prices and age suitability
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dress Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!isEditing) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Organic Cotton Baby Dress"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. organic-cotton-baby-dress"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
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
                    placeholder="e.g. 599"
                    className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
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
                    placeholder="e.g. 999 (shown as strike)"
                    className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dress Type
                  </label>
                  <select
                    value={formDressType}
                    onChange={(e) => setFormDressType(e.target.value)}
                    className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                  >
                    {DRESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stock Status
                  </label>
                  <select
                    value={formStockStatus}
                    onChange={(e) => setFormStockStatus(e.target.value as 'in_stock' | 'out_of_stock' | 'low_stock')}
                    className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="in_stock">In Stock (Available)</option>
                    <option value="low_stock">Low Stock (Hurry)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <ImageUploader
                  label="Dress Photo"
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  aspectRatio="aspect-square"
                  hint="Upload high quality square photo of the dress (e.g. 800×800px)"
                />
              </div>

              {/* Suitable Ages */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Suitable Age Groups
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {AGE_GROUP_OPTIONS.map((age) => {
                    const isSelected = formSuitableAges.includes(age);
                    return (
                      <button
                        type="button"
                        key={age}
                        onClick={() => toggleAge(age)}
                        className={`text-xs font-semibold py-2 px-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#FB7185] border-[#FB7185] text-white shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {age}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Fabric details, soft feel, breathable organic cotton..."
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              {/* Toggles */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNewArrival}
                    onChange={(e) => setFormNewArrival(e.target.checked)}
                    className="w-4 h-4 text-[#FB7185] rounded accent-[#FB7185]"
                  />
                  <span>Mark as New Arrival</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#FB7185] rounded accent-[#FB7185]"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Dress...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Save Changes' : 'Create Dress'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
