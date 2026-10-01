'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, MessageCircle, Plus, Minus, Check } from 'lucide-react';
import { Product, AGE_GROUP_OPTIONS } from '@/lib/supabase/types';

interface WhatsAppOrderModalProps {
  product: Product;
  whatsappNumber?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppOrderModal({
  product,
  whatsappNumber = '917994702567',
  isOpen,
  onClose,
}: WhatsAppOrderModalProps) {
  // Available age groups: use product's configured ages if available, otherwise available list
  const availableAges =
    product.suitable_ages && product.suitable_ages.length > 0
      ? product.suitable_ages
      : AGE_GROUP_OPTIONS.slice(0, 4);

  const [selectedAge, setSelectedAge] = useState<string>(availableAges[0] || '0–3 Months');
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen) return null;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const effectiveNumber = whatsappNumber && !whatsappNumber.includes('98765')
    ? whatsappNumber
    : '917994702567';
  const cleanPhone = effectiveNumber.replace(/\D/g, '') || '917994702567';

  const handleOrder = () => {
    // Current page URL or product link
    const productUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/product/${product.slug}`
      : `https://tinygrow.com/product/${product.slug}`;

    const totalAmount = (Number(product.price) * quantity).toLocaleString('en-IN');
    const unitPrice = Number(product.price).toLocaleString('en-IN');

    const lines = [
      '\uD83D\uDED2 *NEW ORDER - TINYGROW*',
      '--------------------------------',
      `\uD83D\uDC76 *Product:* ${product.name}`,
      `\uD83D\uDCB0 *Total Price:* \u20B9${totalAmount} (${quantity} x \u20B9${unitPrice})`,
      `\uD83D\uDCCF *Age / Size:* ${selectedAge}`,
      `\uD83D\uDCE6 *Quantity:* ${quantity}`,
      '--------------------------------',
      '\uD83D\uDD17 *Product Link:*',
      productUrl,
      '--------------------------------',
      '\u2728 *Please confirm my order and share delivery details. Thank you!*',
    ];

    const message = lines.join('\n');
    // Use TextEncoder to ensure proper UTF-8 encoding of emoji characters
    const encoded = Array.from(new TextEncoder().encode(message))
      .map((b) => '%' + b.toString(16).padStart(2, '0').toUpperCase())
      .join('');

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#0F172A]">Order on WhatsApp</h3>
            <p className="text-xs text-slate-500">Quick direct order with our team</p>
          </div>
        </div>

        {/* Product Snapshot */}
        <div className="flex gap-3.5 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 mb-5">
          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/80 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-xs text-slate-400 font-medium">No Image</div>
            )}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h4 className="font-semibold text-sm text-[#0F172A] truncate">
              {product.name}
            </h4>
            <div className="text-sm font-bold text-[#FB7185] mt-0.5">
              ₹{Number(product.price).toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              In Stock &amp; Ready to Ship
            </span>
          </div>
        </div>

        {/* Select Child Age */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
            Select Child&apos;s Age / Year Group:
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {availableAges.map((age) => {
              const isSelected = selectedAge === age;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => setSelectedAge(age)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#FB7185] bg-[#FFF1F2] text-[#FB7185] shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{age}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FB7185]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Select Quantity */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
            Quantity:
          </label>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-[#0F172A]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-100 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Total: <strong className="text-slate-800">₹{(product.price * quantity).toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOrder}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Send Order on WhatsApp</span>
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-3">
          Orders are confirmed instantly via our WhatsApp Business representative.
        </p>
      </div>
    </div>
  );
}
