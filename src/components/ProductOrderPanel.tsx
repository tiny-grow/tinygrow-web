'use client';

import { useState } from 'react';
import { MessageCircle, Plus, Minus, Check, ShieldCheck, Truck, RotateCcw, ShoppingBag } from 'lucide-react';
import { Product, AGE_GROUP_OPTIONS } from '@/lib/supabase/types';
import OrderAddressModal, { CustomerDeliveryDetails } from './OrderAddressModal';

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
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  const handleAddToCart = () => {
    try {
      const existingCartRaw = typeof window !== 'undefined' ? localStorage.getItem('tinygrow_cart') : null;
      const cart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

      const itemIndex = cart.findIndex(
        (item: any) => item.id === product.id && item.selectedAge === selectedAge
      );

      if (itemIndex > -1) {
        cart[itemIndex].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image_url: product.image_url,
          selectedAge,
          quantity,
        });
      }

      localStorage.setItem('tinygrow_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('tinygrow_cart_updated'));

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

  const effectiveNumber = whatsappNumber && !whatsappNumber.includes('98765')
    ? whatsappNumber
    : '917994702567';
  const cleanPhone = effectiveNumber.replace(/\D/g, '') || '917994702567';

  const handleOrder = () => {
    setIsAddressModalOpen(true);
  };

  const handleConfirmOrder = (details: CustomerDeliveryDetails) => {
    const productUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://tinygrow.com/product/${product.slug}`;

    const totalAmount = (Number(product.price) * quantity).toLocaleString('en-IN');
    const unitPrice = Number(product.price).toLocaleString('en-IN');

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
      '📦 *PRODUCT ORDERED:*',
      `• *Product:* ${product.name}`,
      `• *Age / Size:* ${selectedAge}`,
      `• *Quantity:* ${quantity}`,
      `• *Price:* ₹${totalAmount} (${quantity} × ₹${unitPrice})`,
      `• *Shipping:* FREE Delivery Across India`,
      '================================',
      '🔗 *Product Link:*',
      productUrl,
      '================================',
      '💬 *Please confirm my order and share UPI / payment details. Thank you!*',
    ];

    const message = lines.join('\n');
    const encoded = Array.from(new TextEncoder().encode(message))
      .map((b) => '%' + b.toString(16).padStart(2, '0').toUpperCase())
      .join('');

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsAddressModalOpen(false);
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

      {/* WhatsApp Direct Order & Add to Cart CTAs */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={handleOrder}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 sm:py-4 px-6 rounded-full flex items-center justify-center gap-2.5 shadow-md shadow-emerald-200 hover:shadow-lg transition-all active:scale-[0.99] text-sm sm:text-base cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Order on WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] text-sm sm:text-base cursor-pointer border-2 ${
            addedToCart
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
              : 'bg-white hover:bg-pink-50/60 text-[#FB7185] hover:text-[#F43F5E] border-[#FB7185] shadow-xs hover:shadow-sm'
          }`}
        >
          {addedToCart ? (
            <>
              <Check className="w-5 h-5 stroke-[2.5] text-emerald-600" />
              <span>Added to Bag!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {addedToCart ? (
          <a
            href="/cart"
            className="text-xs text-center font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline mt-1 inline-flex items-center justify-center gap-1"
          >
            <span>View Shopping Bag &amp; Checkout →</span>
          </a>
        ) : (
          <p className="text-xs text-center text-slate-400 mt-1">
            Fast WhatsApp ordering or add to your shopping bag.
          </p>
        )}
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

      {/* Address & Delivery Details Popup Modal */}
      <OrderAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleConfirmOrder}
        orderTitle={product.name}
        orderSubtotalText={`₹${(product.price * quantity).toLocaleString('en-IN')}`}
      />
    </div>
  );
}
