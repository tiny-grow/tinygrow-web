'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Search,
  X,
  ShoppingBag,
  Sparkles,
  Tag,
  ToyBrick,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { Product, Category, AGE_GROUP_OPTIONS } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSuitableAges, setFormSuitableAges] = useState<string[]>([]);
  const [formStockStatus, setFormStockStatus] = useState<'in_stock' | 'out_of_stock' | 'low_stock'>('in_stock');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(true);
  const [formIsToy, setFormIsToy] = useState(false);
  const [formIsAccessory, setFormIsAccessory] = useState(false);
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
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(*)')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      setProducts((prodRes.data as Product[]) || []);
      setCategories((catRes.data as Category[]) || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error fetching store products');
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
    setFormDescription('');
    setFormImageUrl('');
    setFormSuitableAges([]);
    setFormStockStatus('in_stock');
    setFormFeatured(false);
    setFormNewArrival(true);
    setFormIsToy(false);
    setFormIsAccessory(false);
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
    setFormDescription(p.description || '');
    setFormImageUrl(p.image_url || '');
    setFormSuitableAges(p.suitable_ages || []);
    setFormStockStatus(p.stock_status);
    setFormFeatured(p.featured);
    setFormNewArrival(p.is_new_arrival);
    setFormIsToy(p.is_toy);
    setFormIsAccessory(p.is_accessory || false);
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
      } else {
        setSuccessMsg(`Product "${name}" deleted.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchData();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete product');
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
    setSuccessMsg(null);
    setSaving(true);

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase credentials not configured in .env.local');
      setSaving(false);
      return;
    }

    const slug = formSlug.trim() || formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      name: formName.trim(),
      slug,
      category_id: formCategoryId ? formCategoryId : null,
      price: Number(formPrice) || 0,
      description: formDescription.trim() || null,
      image_url: formImageUrl.trim() || null,
      suitable_ages: formSuitableAges,
      stock_status: formStockStatus,
      featured: formFeatured,
      is_new_arrival: formNewArrival,
      is_toy: formIsToy,
      is_accessory: formIsAccessory,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      if (isEditing && editingId) {
        const { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId)
          .select();

        if (error) {
          throw new Error(error.message || error.details || 'Failed to update product');
        }
        if (!data || data.length === 0) {
          throw new Error(
            'Database update was blocked by Supabase Row-Level Security (RLS). Please paste and run the SQL from supabase/schema.sql in your Supabase Dashboard -> SQL Editor.'
          );
        }
        setSuccessMsg(`Product "${formName}" updated successfully!`);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select();
        if (error) {
          throw new Error(error.message || error.details || 'Failed to create product');
        }
        if (!data || data.length === 0) {
          throw new Error(
            'Database insert was blocked by Supabase Row-Level Security (RLS). Please paste and run the SQL from supabase/schema.sql in your Supabase Dashboard -> SQL Editor.'
          );
        }
        setSuccessMsg(`Product "${formName}" created successfully!`);
      }

      resetForm();
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Operation failed';
      setErrorMsg(msg);
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
      const catName = (p.categories as any)?.name?.toLowerCase() || '';
      const fullText = `${name} ${slug} ${desc} ${catName}`;
      matchesSearch = qWords.every((w) => fullText.includes(w));
    }
    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : categoryFilter === 'toys'
        ? p.is_toy
        : categoryFilter === 'accessories'
        ? p.is_accessory
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
            <span>Store Products</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your baby clothing and toy catalog. Add photos, adjust pricing, and toggle stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Shop</span>
          </Link>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="p-1 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-700">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="p-1 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="my-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#38BDF8] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              <option value="toys">Toys Only ({products.filter((p) => p.is_toy).length})</option>
              <option value="accessories">Accessories Only ({products.filter((p) => p.is_accessory).length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({products.filter((p) => p.category_id === c.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FB7185] animate-spin" />
          <span className="text-xs font-medium">Loading store products...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-[#FB7185]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {searchQuery || categoryFilter !== 'all'
                ? 'No products match your search or filter'
                : 'No products in your store yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add New Product&quot; to create your first baby outfit or toy.
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-2 bg-[#FB7185] text-white font-bold text-xs py-2 px-4 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product</span>
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
                      {p.is_toy ? (
                        <ToyBrick className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
                      ) : p.is_accessory ? (
                        <Tag className="w-8 h-8 text-violet-400" strokeWidth={1.5} />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-pink-400" strokeWidth={1.5} />
                      )}
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

                  {/* Toy Badge */}
                  {p.is_toy && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        <ToyBrick className="w-3 h-3" />
                        <span>Toy</span>
                      </span>
                    </div>
                  )}

                  {/* Accessory Badge */}
                  {p.is_accessory && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-2xs">
                        <Tag className="w-3 h-3" />
                        <span>Accessory</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#FB7185] transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px] leading-snug" title={p.name}>
                    {p.name}
                  </h3>
                  <span className="text-xs font-black text-[#0F172A] shrink-0 mt-0.5">
                    ₹{Number(p.price).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {p.categories?.name || 'Uncategorized'}
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
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0284C7] transition-colors"
                  title="View product on live store"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Store</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#0284C7] bg-slate-50 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200/80"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.name)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {isEditing ? `Edit Product: ${formName}` : 'Add New Product'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in the details below. Once saved, it will appear on your storefront and shop page.
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
                {/* Column 1: Info */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Product Name *
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
                      placeholder="e.g. Organic Cotton Romper"
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
                      placeholder="e.g. organic-cotton-romper"
                      className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Price (₹) *
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Crafted from 100% organic soft cotton, smooth snaps..."
                      className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                </div>

                {/* Column 2: Photo & Options */}
                <div className="flex flex-col gap-4">
                  {/* Photo Uploader */}
                  <div>
                    <ImageUploader
                      label="Product Photo"
                      value={formImageUrl}
                      onChange={setFormImageUrl}
                      aspectRatio="aspect-square"
                      hint="Upload product photo. It will appear on your shop and homepage."
                    />
                  </div>

                  {/* Suitable Ages */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Suitable Age Groups
                    </label>
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
                                ? 'bg-[#FB7185] text-white shadow-2xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                            <span>{age}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formNewArrival}
                        onChange={(e) => setFormNewArrival(e.target.checked)}
                        className="w-4 h-4 text-[#FB7185] rounded accent-[#FB7185]"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Mark as New Arrival (Homepage Display)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 text-[#FB7185] rounded accent-[#FB7185]"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Featured Product
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsToy}
                        onChange={(e) => setFormIsToy(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Is Toy / Montessori Item
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsAccessory}
                        onChange={(e) => setFormIsAccessory(e.target.checked)}
                        className="w-4 h-4 text-violet-600 rounded accent-violet-600"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Is Baby Accessory (Bibs, Caps, Socks, Mittens)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isEditing ? 'Save Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
