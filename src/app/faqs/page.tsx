'use client';

import { useState } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HelpCircle, ChevronDown, MessageCircle, Sparkles } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Orders & WhatsApp',
    question: 'How does ordering through WhatsApp work?',
    answer:
      'Ordering on TinyGrow is delightfully simple! Simply add items to your cart or click "Order on WhatsApp" on any product page. This generates a structured WhatsApp message detailing your selected products, sizes, and quantities. Our customer care team instantly confirms availability and provides convenient payment options.',
  },
  {
    category: 'Orders & WhatsApp',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major secure Indian payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Debit/Credit Cards, and Cash on Delivery (COD) for eligible pin codes.',
  },
  {
    category: 'Safety & Materials',
    question: 'Are TinyGrow clothes 100% safe for newborns and sensitive skin?',
    answer:
      'Yes, absolutely! Every garment is tailored from 100% certified organic breathable cotton dyed with non-toxic, hypoallergenic water-based dyes. We use flat-lock smooth seams and tagless necklines to prevent any scratching or irritation on delicate newborn skin.',
  },
  {
    category: 'Safety & Materials',
    question: 'Are your wooden and silicone toys baby-safe?',
    answer:
      'Our wooden toys are crafted from natural sustainably harvested beechwood polished with organic beeswax and food-grade mineral oil. Our silicone teethers and accessories are 100% BPA-free, lead-free, phthalate-free, and FDA certified food-grade silicone.',
  },
  {
    category: 'Sizing & Care',
    question: 'How do I choose the right size for my baby?',
    answer:
      'Babies grow at their own wonderful pace! We recommend consulting our detailed Size Guide which lists age, height, and weight benchmarks. If your little one is between sizes, we always suggest choosing the larger size for extra comfort and room to grow.',
  },
  {
    category: 'Sizing & Care',
    question: 'How should I wash and care for TinyGrow organic garments?',
    answer:
      'For best results and longevity, machine wash gentle in cold or lukewarm water with a mild baby-safe detergent. Line dry in the shade to preserve vibrant pastel colors. Do not bleach or tumble dry on high heat.',
  },
  {
    category: 'Shipping & Returns',
    question: 'What are your delivery charges and shipping times?',
    answer:
      'We offer FREE Shipping across India on all orders. Metro orders typically arrive in 2–4 business days, and other cities within 3–6 business days.',
  },
  {
    category: 'Shipping & Returns',
    question: 'What is your return policy if the item doesn’t fit?',
    answer:
      'We offer an easy 7-day hassle-free return and size exchange policy for unworn, tagged items. Simply message our WhatsApp team, and we will coordinate a reverse pickup from your doorstep.',
  },
];

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Orders & WhatsApp', 'Safety & Materials', 'Sizing & Care', 'Shipping & Returns'];

  const filteredFaqs =
    activeCategory === 'All'
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 w-full bg-slate-50/50 py-10 sm:py-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-100 shadow-sm">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Customer Care</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Find quick answers to common questions about ordering, sizing, organic materials, and delivery.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion FAQ Items */}
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={faq.question} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between text-left gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-sm sm:text-base text-[#0F172A]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#FB7185]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed bg-pink-50/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WhatsApp Support Box */}
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Still have questions?</h2>
              <p className="text-xs text-slate-600">Our friendly baby care team is just a message away.</p>
            </div>
            <a
              href="https://api.whatsapp.com/send?phone=917994702567&text=Hi%20TinyGrow%2C%20I%20have%20a%20question%20about%20your%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-md transition-all whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Ask us on WhatsApp</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
