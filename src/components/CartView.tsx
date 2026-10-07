'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { ContactInformation } from '@/lib/supabase/types';
import OrderAddressModal, { CustomerDeliveryDetails } from '@/components/OrderAddressModal';

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string | null;
  selectedAge?: string;
  quantity: number;
}

interface CartViewProps {
  contact?: ContactInformation | null;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop';

export default function CartView({ contact }: CartViewProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Customer & Delivery Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savedDetails, setSavedDetails] = useState<CustomerDeliveryDetails | null>(null);

  const effectivePhone =
    contact?.whatsapp_number && !contact.whatsapp_number.includes('98765')
      ? contact.whatsapp_number
      : '+91 79947 02567';
  const cleanPhone = effectivePhone.replace(/\D/g, '') || '917994702567';

  // Load cart and saved delivery details from localStorage
  const loadCart = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('tinygrow_cart') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
          return;
        }
      }
      setCartItems([]);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
    setMounted(true);

    try {
      const saved = localStorage.getItem('tinygrow_customer_details');
      if (saved) {
        setSavedDetails(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    const handleUpdate = () => loadCart();
    window.addEventListener('tinygrow_cart_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('tinygrow_cart_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('tinygrow_cart', JSON.stringify(items));
      window.dispatchEvent(new Event('tinygrow_cart_updated'));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    saveCart(updated);
  };

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    saveCart(updated);
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to empty your shopping bag?')) {
      saveCart([]);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const totalItemCount = cartItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
  const grandTotal = subtotal;

  // WhatsApp Order Confirmation with customer delivery details
  const handleConfirmOrder = (details: CustomerDeliveryDetails) => {
    setSavedDetails(details);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tinygrow.com';

    const itemLines = cartItems.map((item, idx) => {
      const itemSubtotal = (Number(item.price) * item.quantity).toLocaleString('en-IN');
      const unitPrice = Number(item.price).toLocaleString('en-IN');
      const sizeText = item.selectedAge ? ` (Age/Size: ${item.selectedAge})` : '';
      return `${idx + 1}. *${item.name}*${sizeText}\n   • Qty: ${item.quantity} × ₹${unitPrice} = *₹${itemSubtotal}*\n   • Link: ${origin}/product/${item.slug}`;
    });

    const lines = [
      '🛍️ *NEW ORDER - TINYGROW*',
      '================================',
      '👤 *CUSTOMER & DELIVERY DETAILS:*',
      `• *Name:* ${details.name}`,
      `• *WhatsApp:* ${details.phone}`,
      `• *Address:* ${details.address}`,
      `• *District:* ${details.district}`,
      `• *State:* ${details.state}`,
      `• *PIN Code:* ${details.pincode}`,
      '================================',
      '📦 *ITEMS ORDERED:*',
      itemLines.join('\n\n'),
      '================================',
      `• *Subtotal:* ₹${subtotal.toLocaleString('en-IN')}`,
      `🚚 *Shipping:* Delivery Across PAN India`,
      `✨ *Grand Total:* ₹${grandTotal.toLocaleString('en-IN')}`,
      '================================',
      '💬 *Please confirm item availability and share UPI / payment details. Thank you!*',
    ];

    const message = lines.join('\n');
    const encoded = Array.from(new TextEncoder().encode(message))
      .map((b) => '%' + b.toString(16).padStart(2, '0').toUpperCase())
      .join('');

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsAddressModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#FB7185] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-semibold">Opening your shopping bag...</p>
      </div>
    );
  }

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        {/* Soft floating doodle badge */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-100 via-rose-50 to-sky-100 animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl shadow-md border border-pink-100/80 flex items-center justify-center text-[#FB7185]">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.6]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2.5">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Looks like you haven’t added any gentle organic clothes or sweet toys yet. Explore our handpicked baby collections below:
        </p>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <Link
            href="/category/dresses"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-pink-50 text-slate-700 hover:text-[#FB7185] border border-slate-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            Baby Dresses
          </Link>
          <Link
            href="/category/accessories"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] border border-slate-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            Accessories
          </Link>
          <Link
            href="/category/toys"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            Joyful Toys
          </Link>
          <Link
            href="/new-arrivals"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            New Arrivals
          </Link>
        </div>

        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-full shadow-lg shadow-pink-200/80 transition-all active:scale-[0.98]"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAFBFD] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#FB7185] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#FB7185] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Shopping Bag</span>
        </div>

        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/70 gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
              <span>Shopping Bag</span>
              <span className="text-xs font-extrabold bg-[#FFF1F2] text-[#FB7185] px-3 py-1 rounded-full border border-pink-100">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Review your items and place your direct order through WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Bag</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ── Left Column: Items & Free Shipping Progress (col-span 7/8) ── */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            {/* Delivery Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  🎉 <strong>Delivery Across PAN India</strong> on your order!
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                ACTIVE
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex flex-col gap-3">
              {cartItems.map((item, index) => {
                const itemTotal = (Number(item.price) || 0) * item.quantity;
                const imgSrc = item.image_url || DEFAULT_IMAGE;

                return (
                  <div
                    key={`${item.id}-${item.selectedAge || 'default'}-${index}`}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 p-3.5 sm:p-5 shadow-xs hover:border-pink-200 transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Thumbnail */}
                      <Link
                        href={`/product/${item.slug}`}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 block group"
                      >
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Content & Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-sm sm:text-base font-bold text-[#0F172A] hover:text-[#FB7185] transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>

                            {/* Size/Age Tag */}
                            {item.selectedAge && (
                              <div className="inline-flex items-center gap-1.5 mt-1">
                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-slate-400" />
                                  <span>Age: {item.selectedAge}</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                            title="Remove from bag"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity and Price Bar */}
                        <div className="mt-3.5 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                          {/* Unit Price */}
                          <div className="text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-800 text-sm">
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-slate-400"> / item</span>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-5 ml-auto">
                            {/* Quantity Controls */}
                            <div className="inline-flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-bold text-xs sm:text-sm text-[#0F172A]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-[70px]">
                              <span className="text-xs text-slate-400 block sm:hidden">Total</span>
                              <span className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                                ₹{itemTotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping Link */}
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* ── Right Column: Order Summary & WhatsApp Checkout (col-span 5/4) ── */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
                  Order Summary
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Price Calculations */}
              <div className="space-y-3 text-xs sm:text-sm pb-4 border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 items-center">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#0F172A] pt-3 border-t border-dashed border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-xl font-extrabold text-[#0284C7]">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Delivery Details Card */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Delivery Address
                  </h3>
                  <span className="text-[10px] text-slate-400">Required for delivery</span>
                </div>

                {savedDetails ? (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Delivery Destination</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {savedDetails.name} • {savedDetails.phone}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {savedDetails.address}, {savedDetails.district}, {savedDetails.state} -{' '}
                      {savedDetails.pincode}
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-2xl flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Delivery Details Popup</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        A quick popup will ask for your Name, Address, District, State &amp; PIN code
                        when placing your order.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order on WhatsApp CTA */}
              <div className="mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-3.5 sm:py-4 px-5 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-200/60 hover:shadow-xl transition-all active:scale-[0.99] text-sm sm:text-base cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Order on WhatsApp • ₹{grandTotal.toLocaleString('en-IN')}</span>
                </button>

                <p className="text-[11px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Direct confirmation with TinyGrow customer care</span>
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-2xl border border-slate-200/70 text-center text-slate-600 text-[11px] shadow-2xs">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#0284C7]" />
                <span className="font-bold">Fast Dispatch</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <span className="font-bold">100% Baby Safe</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#0284C7]" />
                <span className="font-bold">24h Return Request</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Delivery Details Modal */}
      <OrderAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleConfirmOrder}
        orderTitle={`${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'} in shopping bag`}
        orderSubtotalText={`₹${grandTotal.toLocaleString('en-IN')}`}
      />
    </div>
  );
}
