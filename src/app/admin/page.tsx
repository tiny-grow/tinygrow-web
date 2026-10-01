import { redirect } from 'next/navigation';
import Image from 'next/image';
import {
  getCategories,
  getProducts,
  getHeroBanner,
  getAboutSection,
  getContactInformation,
  getSocialLinks,
} from '@/lib/supabase/queries';
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  ShoppingBag,
  Layers,
  Sparkles,
  Plus,
  ArrowRight,
  ImageIcon,
  PhoneCall,
  ToyBrick,
  Tag,
  CheckCircle2,
  Globe,
  Check,
  AlertCircle,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Server-side auth guard (secondary to middleware)
  if (isSupabaseServerConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/admin/login');
  }

  const [categories, products, hero, about, contact, socials] = await Promise.all([
    getCategories(),
    getProducts(),
    getHeroBanner(),
    getAboutSection(),
    getContactInformation(),
    getSocialLinks(),
  ]);

  const toyProducts = products.filter((p) => p.is_toy);
  const accessoryProducts = products.filter((p) => p.is_accessory);
  const newArrivals = products.filter((p) => p.is_new_arrival);
  const inStockProducts = products.filter((p) => p.stock_status === 'in_stock');

  const stats = [
    { label: 'Total Products', count: products.length, icon: ShoppingBag, gradient: 'from-pink-500 to-rose-500', href: '/admin/products' },
    { label: 'Categories', count: categories.length, icon: Layers, gradient: 'from-purple-500 to-violet-500', href: '/admin/categories' },
    { label: 'Toys', count: toyProducts.length, icon: ToyBrick, gradient: 'from-emerald-500 to-teal-500', href: '/admin/toys' },
    { label: 'Accessories', count: accessoryProducts.length, icon: Tag, gradient: 'from-violet-500 to-purple-500', href: '/admin/accessories' },
    { label: 'New Arrivals', count: newArrivals.length, icon: Sparkles, gradient: 'from-amber-400 to-orange-500', href: '/admin/products' },
    { label: 'In Stock', count: inStockProducts.length, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500', href: '/admin/products' },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products', icon: ShoppingBag, iconColor: 'text-pink-500', desc: 'Clothes & general items', color: 'hover:border-pink-300 hover:bg-pink-50/50' },
    { label: 'Add Toys', href: '/admin/toys', icon: ToyBrick, iconColor: 'text-emerald-500', desc: 'Montessori & soft toys', color: 'hover:border-emerald-300 hover:bg-emerald-50/50' },
    { label: 'Add Accessories', href: '/admin/accessories', icon: Tag, iconColor: 'text-violet-500', desc: 'Bibs, caps, socks & mittens', color: 'hover:border-violet-300 hover:bg-violet-50/50' },
    { label: 'Add Category', href: '/admin/categories', icon: Layers, iconColor: 'text-purple-500', desc: 'Organize your products', color: 'hover:border-purple-300 hover:bg-purple-50/50' },
    { label: 'Edit Hero Banner', href: '/admin/hero', icon: Sparkles, iconColor: 'text-amber-500', desc: 'Change homepage banner', color: 'hover:border-yellow-300 hover:bg-yellow-50/50' },
    { label: 'Homepage Banners', href: '/admin/banners', icon: ImageIcon, iconColor: 'text-pink-500', desc: 'Promo cards & about section', color: 'hover:border-pink-300 hover:bg-pink-50/50' },
    { label: 'Update Contact', href: '/admin/contact', icon: PhoneCall, iconColor: 'text-sky-500', desc: 'WhatsApp & phone number', color: 'hover:border-sky-300 hover:bg-sky-50/50' },
  ];

  const configStatus = [
    {
      label: 'Hero Banner Image',
      ok: !!hero?.image_url,
      okText: 'Image uploaded',
      warnText: 'No image — add one',
      href: '/admin/hero',
    },
    {
      label: 'Categories with Photos',
      ok: categories.filter((c) => c.image_url).length > 0,
      okText: `${categories.filter((c) => c.image_url).length}/${categories.length} have photos`,
      warnText: 'No category photos yet',
      href: '/admin/categories',
    },
    {
      label: 'Products with Photos',
      ok: products.filter((p) => p.image_url).length > 0,
      okText: `${products.filter((p) => p.image_url).length}/${products.length} have photos`,
      warnText: 'No product photos yet',
      href: '/admin/products',
    },
    {
      label: 'WhatsApp Number',
      ok: !!contact?.whatsapp_number,
      okText: contact?.whatsapp_number || '',
      warnText: 'Not set — update contact',
      href: '/admin/contact',
    },
    {
      label: 'Social Links',
      ok: socials.length > 0,
      okText: `${socials.length} links configured`,
      warnText: 'No social links',
      href: '/admin/social',
    },
  ];

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Welcome Header with Exact Logo */}
      <div className="mb-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl shrink-0 flex items-center justify-center">
            <div className="relative h-10 sm:h-12 w-36 sm:w-44">
              <Image
                src="/tinygrow-logo.png"
                alt="TinyGrow Logo"
                fill
                sizes="180px"
                priority
                className="object-contain object-left"
              />
            </div>
          </div>
          <div className="sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Store Dashboard
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#FB7185] border border-pink-100">
                Admin Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your products, categories, homepage banners, and customer contact settings.
            </p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all w-fit"
        >
          <Globe className="w-4 h-4 text-sky-400" />
          <span>View Live Store</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 flex flex-col justify-between"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stat.count}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4 text-pink-500" />
            Quick Actions
          </h2>
          <p className="text-xs text-slate-400 mb-5">Jump straight to the most common tasks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 p-4 rounded-xl border border-slate-200 transition-all group ${action.color}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <ActionIcon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-400">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Store Health Checklist — 1/3 width */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            Store Health
          </h2>
          <p className="text-xs text-slate-400 mb-5">Quick checklist for your store setup</p>
          <div className="flex flex-col gap-3">
            {configStatus.map((item) => (
              <Link key={item.label} href={item.href} className="group flex items-start gap-2.5 hover:opacity-80 transition-opacity">
                <div className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-xs ${
                  item.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {item.ok ? <Check className="w-3 h-3 stroke-[2.5]" /> : <AlertCircle className="w-3 h-3 stroke-[2.5]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{item.label}</p>
                  <p className={`text-[11px] font-medium ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {item.ok ? item.okText : item.warnText}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products Preview */}
      {products.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pink-500" />
              Recent Products
            </h2>
            <Link href="/admin/products" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left font-bold text-slate-500 pb-2 pr-4">Product</th>
                  <th className="text-left font-bold text-slate-500 pb-2 pr-4">Category</th>
                  <th className="text-left font-bold text-slate-500 pb-2 pr-4">Price</th>
                  <th className="text-left font-bold text-slate-500 pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            : <ShoppingBag className="w-4 h-4 text-slate-400" />
                          }
                        </div>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{(p.categories as any)?.name || '—'}</td>
                    <td className="py-2.5 pr-4 font-bold text-slate-800">₹{Number(p.price).toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock_status === 'in_stock' ? 'bg-emerald-100 text-emerald-700' :
                        p.stock_status === 'low_stock' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {p.stock_status === 'in_stock' ? 'In Stock' : p.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
