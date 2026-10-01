'use client';

import { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Building,
  Flag,
  Navigation,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export interface CustomerDeliveryDetails {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  district: string;
  state: string;
}

interface OrderAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: CustomerDeliveryDetails) => void;
  orderTitle?: string;
  orderSubtotalText?: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Jammu & Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
];

export default function OrderAddressModal({
  isOpen,
  onClose,
  onConfirm,
  orderTitle,
  orderSubtotalText,
}: OrderAddressModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load saved details from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tinygrow_customer_details');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.pincode) setPincode(parsed.pincode);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.state) setState(parsed.state);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }
    if (!phone.trim() || phone.trim().replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your Delivery Address (House / Street).');
      return;
    }
    if (!district.trim()) {
      setErrorMsg('Please enter your District / City.');
      return;
    }
    if (!state.trim()) {
      setErrorMsg('Please select or enter your State.');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-digit Pincode.');
      return;
    }

    const details: CustomerDeliveryDetails = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      district: district.trim(),
      state: state.trim(),
    };

    // Save to localStorage for convenience next time
    try {
      localStorage.setItem('tinygrow_customer_details', JSON.stringify(details));
    } catch {
      // ignore
    }

    onConfirm(details);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-sky-50 px-5 sm:px-7 py-4 sm:py-5 border-b border-pink-100/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#FB7185] flex items-center justify-center shadow-xs border border-pink-100 shrink-0">
              <MapPin className="w-5 h-5 text-[#FB7185]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
                Delivery Details
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enter your address to place order on WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-4">
          {/* Order Summary badge if passed */}
          {orderTitle && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 truncate max-w-[240px]">
                {orderTitle}
              </span>
              {orderSubtotalText && (
                <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                  {orderSubtotalText}
                </span>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl animate-shake">
              {errorMsg}
            </div>
          )}

          {/* 1. Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 2. WhatsApp Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              WhatsApp Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 3. Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              House No., Street &amp; Landmark <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Apartment / Street, Landmark"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white resize-none transition-all"
              />
            </div>
          </div>

          {/* 4. District & State (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                District / City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Mumbai / Pune"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Flag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#25D366] focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. Pincode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              PIN Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit PIN Code (e.g. 400001)"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-200/60 hover:shadow-xl transition-all active:scale-[0.99] text-sm sm:text-base cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Confirm &amp; Open WhatsApp</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your address is saved securely for this delivery</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
