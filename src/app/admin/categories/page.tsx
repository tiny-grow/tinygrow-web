'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Check, AlertCircle, Loader2, Search, X, Layers, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Category } from '@/lib/supabase/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setCategories((data as Category[]) || []);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImageUrl('');
    setFormOrder(0);
    setFormActive(true);
    setIsModalOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || '');
    setFormImageUrl(category.image_url || '');
    setFormOrder(category.display_order || 0);
    setFormActive(category.active);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase not configured in .env.local');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(`Category "${name}" deleted.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchCategories();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete');
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

    try {
      const supabase = createClient();
      const payload = {
        name: formName.trim(),
        slug,
        description: formDescription.trim() || null,
        image_url: formImageUrl.trim() || null,
        display_order: Number(formOrder),
        active: formActive,
      };

      if (isEditing && editingId) {
        const { data, error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingId)
          .select();

        if (error) {
          throw new Error(error.message || error.details || 'Failed to update category');
        }
        if (!data || data.length === 0) {
          throw new Error(
            'Database update was blocked by Supabase Row-Level Security (RLS). Please paste and run the SQL from supabase/schema.sql in your Supabase Dashboard -> SQL Editor.'
          );
        }
        setSuccessMsg(`Category "${formName}" updated successfully!`);
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert(payload)
          .select();

        if (error) {
          throw new Error(error.message || error.details || 'Failed to create category');
        }
        if (!data || data.length === 0) {
          throw new Error(
            'Database insert was blocked by Supabase Row-Level Security (RLS). Please paste and run the SQL from supabase/schema.sql in your Supabase Dashboard -> SQL Editor.'
          );
        }
        setSuccessMsg(`Category "${formName}" created successfully!`);
      }

      resetForm();
      fetchCategories();
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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-6xl w-full mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#FB7185]" />
            <span>Store Categories</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize products into categories. Photos added here appear on your homepage category cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront ↗</span>
          </Link>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Category</span>
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

      {/* Quick Search & Count */}
      <div className="my-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
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

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>{categories.length} total categories</span>
        </div>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FB7185] animate-spin" />
          <span className="text-xs font-medium">Loading categories...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-[#FB7185]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {searchQuery ? 'No categories matching your search' : 'No categories created yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add New Category&quot; above to add your first category with an image.
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-2 bg-[#FB7185] text-white font-bold text-xs py-2 px-4 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Category</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Category Image Header */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-slate-100 flex items-center justify-center bg-gradient-to-br from-[#FDF0EC] via-[#FFF6EA] to-[#F1F7EE]">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                        {c.slug.includes('dress') || c.name.toLowerCase().includes('dress')
                          ? '👗'
                          : c.slug.includes('toy') || c.name.toLowerCase().includes('toy')
                          ? '🧸'
                          : '🍼'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Click Edit to upload banner photo
                      </span>
                    </div>
                  )}

                  {/* Active Badge on Image */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                        c.active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700/80 text-white backdrop-blur-2xs'
                      }`}
                    >
                      {c.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{c.active ? 'Active' : 'Hidden'}</span>
                    </span>
                  </div>
                </div>

                {/* Name & Slug */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#FB7185] transition-colors">
                    {c.name}
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    Order: {c.display_order}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-[#38BDF8] mb-2">/{c.slug}</p>

                {c.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={`/category/${c.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0284C7] transition-colors"
                  title="View category page on live store"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View in Store</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0284C7] bg-slate-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200/80"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
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

      {/* Add / Edit Category Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-extrabold text-slate-900">
                {isEditing ? `Edit Category: ${formName}` : 'Add New Category'}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category Name *
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
                  placeholder="e.g. Baby Dresses"
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
                  placeholder="e.g. baby-dresses"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Adorable outfits for every cheerful moment"
                  className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              {/* Photo Upload with live preview & Cloudinary upload */}
              <div>
                <ImageUploader
                  label="Category Photo"
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  aspectRatio="aspect-video"
                  hint="This photo will be displayed on the homepage category cards."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="modalCatActive"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-[#FB7185] rounded accent-[#FB7185]"
                  />
                  <label htmlFor="modalCatActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Active / Store Visible
                  </label>
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
                  <span>{isEditing ? 'Save Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
