'use client';

import { useState } from 'react';
import { MessageCircle, Plus, Minus, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product, AGE_GROUP_OPTIONS } from '@/lib/supabase/types';

interface ProductOrderPanelProps {
  product: Product;
  whatsappNumber?: string | null;
}

export default function ProductOrderPanel({
  product,
  whatsappNumber = '917994702567',
}: ProductOrderPanelProps) {
  // Use product configured ages or available default ages
  const availableAges =
    product.suitable_ages && product.suitable_ages.length > 0
      ? product.suitable_ages
      : AGE_GROUP_OPTIONS.slice(0, 4);

  const [selectedAge, setSelectedAge] = useState<string>(availableAges[0] || '0–3 Months');
  const [quantity, setQuantity] = useState<number>(1);

  const effectiveNumber = whatsappNumber && !whatsappNumber.includes('98765')
    ? whatsappNumber
    : '917994702567';
  const cleanPhone = effectiveNumber.replace(/\D/g, '') || '917994702567';

  const handleOrder = () => {
    const productUrl =
      typeof window !== 'undefined'
        ? window.location.href
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
    <div className="flex flex-col">
      {/* Age Selection */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2.5">
          Select Child Age / Year Group:
        </label>
        <div className="flex flex-wrap gap-2">
          {availableAges.map((age) => {
            const isSelected = selectedAge === age;
            return (
              <button
                key={age}
                type="button"
                onClick={() => setSelectedAge(age)}
                className={`py-2 px-3.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#FB7185] bg-[#FFF1F2] text-[#FB7185] shadow-xs ring-1 ring-[#FB7185]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{age}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FB7185]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2.5">
          Quantity:
        </label>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-100 disabled:opacity-40 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-bold text-base text-[#0F172A]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total Price: <strong className="text-slate-900 text-sm">₹{(product.price * quantity).toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* WhatsApp Direct Order CTA Button */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleOrder}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2.5 shadow-md shadow-emerald-200 hover:shadow-lg transition-all active:scale-[0.99] text-base"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Order on WhatsApp</span>
        </button>

        <p className="text-xs text-center text-slate-400">
          No online payment checkout needed. Our team will verify size and confirm your order directly on WhatsApp.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-100 text-slate-600">
        <div className="flex flex-col items-center text-center gap-1.5">
          <Truck className="w-5 h-5 text-[#0284C7]" />
          <span className="text-[11px] font-semibold">Fast Shipping</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5">
          <ShieldCheck className="w-5 h-5 text-[#0284C7]" />
          <span className="text-[11px] font-semibold">100% Baby Safe</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5">
          <RotateCcw className="w-5 h-5 text-[#0284C7]" />
          <span className="text-[11px] font-semibold">Easy Returns</span>
        </div>
      </div>
    </div>
  );
}
