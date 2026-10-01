'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="px-6 sm:px-10 lg:px-12 py-6 bg-white">
      <div className="max-w-7xl mx-auto rounded-3xl bg-[#FFF3F0] border border-pink-100/60 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Icon & Copy */}
        <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center text-[#FB7185] shadow-xs flex-shrink-0 border border-pink-100">
            <Mail className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Join Our Little Circle
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Get exclusive offers, new arrivals and parenting tips.
            </p>
          </div>
        </div>

        {/* Right Side: Input & Subscribe Button */}
        <div className="w-full md:w-auto">
          {subscribed ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold text-xs sm:text-sm py-3 px-6 rounded-full border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Thank you for joining our Little Circle!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 max-w-md w-full"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-white text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] rounded-full py-3 px-5 border border-pink-100 focus:outline-none focus:border-[#FB7185] shadow-xs transition-colors"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#FB7185] hover:bg-[#F43F5E] text-white font-semibold text-xs sm:text-sm py-3 px-6 rounded-full shadow-xs transition-all active:scale-[0.98] flex-shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
