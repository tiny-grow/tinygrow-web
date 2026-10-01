'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase is not configured. Please add environment variables to your .env.local file.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMsg(
          error.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Please try again.'
            : error.message
        );
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to authenticate. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="relative z-10 w-full max-w-[440px] mx-5"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Main Card */}
      <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-black/60">
        {/* Card shimmer border */}
        <div
          className="absolute inset-0 rounded-[28px] z-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, rgba(251,113,133,0.15) 100%)',
            padding: '1px',
          }}
        />

        {/* Card body */}
        <div
          className="relative z-10 rounded-[27px] px-8 sm:px-10 pt-10 pb-8"
          style={{
            background: 'linear-gradient(160deg, rgba(15,23,42,0.97) 0%, rgba(20,15,35,0.99) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        >
          {/* Top Brand Section */}
          <div className="flex flex-col items-center text-center mb-9">
            {/* Logo pill */}
            <div
              className="relative mb-5 px-7 py-3.5 rounded-2xl shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #fff 60%, #fff0f4 100%)',
                boxShadow: '0 8px 32px rgba(251,113,133,0.25), 0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <div className="relative h-12 w-44">
                <Image
                  src="/tinygrow-logo.png"
                  alt="TinyGrow Logo"
                  fill
                  sizes="176px"
                  priority
                  className="object-contain object-center"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Admin Portal
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px flex-1 max-w-[50px] bg-gradient-to-r from-transparent to-white/10" />
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Secure Access
                </p>
                <div className="h-px flex-1 max-w-[50px] bg-gradient-to-l from-transparent to-white/10" />
              </div>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div
              className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm text-rose-300"
              style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.2)',
              }}
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div className="group">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  boxShadow: focusedField === 'email'
                    ? '0 0 0 2px rgba(251,113,133,0.45), 0 4px 16px rgba(0,0,0,0.2)'
                    : '0 0 0 1px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {/* Field bg */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: focusedField === 'email'
                      ? 'linear-gradient(135deg, rgba(251,113,133,0.06) 0%, rgba(255,255,255,0.04) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    transition: 'background 0.2s',
                  }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Mail
                    className="w-4 h-4 transition-colors duration-200"
                    style={{ color: focusedField === 'email' ? '#FB7185' : '#64748b' }}
                  />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="admin@tinygrow.com"
                  className="relative z-10 w-full bg-transparent text-white text-sm py-3.5 pl-11 pr-4 placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  boxShadow: focusedField === 'password'
                    ? '0 0 0 2px rgba(251,113,133,0.45), 0 4px 16px rgba(0,0,0,0.2)'
                    : '0 0 0 1px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: focusedField === 'password'
                      ? 'linear-gradient(135deg, rgba(251,113,133,0.06) 0%, rgba(255,255,255,0.04) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    transition: 'background 0.2s',
                  }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock
                    className="w-4 h-4 transition-colors duration-200"
                    style={{ color: focusedField === 'password' ? '#FB7185' : '#64748b' }}
                  />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••••"
                  className="relative z-10 w-full bg-transparent text-white text-sm py-3.5 pl-11 pr-12 placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading}
              className="relative mt-1 w-full font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 text-sm text-white overflow-hidden transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)'
                  : 'linear-gradient(135deg, #FB7185 0%, #F43F5E 50%, #E11D48 100%)',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(244,63,94,0.4), 0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {/* Shimmer overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)',
                }}
              />
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  <span className="relative z-10">Signing in…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-600 mt-7 leading-relaxed">
            Use your administrator credentials to access the management dashboard.
          </p>
        </div>
      </div>

      {/* Back link */}
      <div className="text-center mt-6">
        <a
          href="/"
          className="text-xs text-slate-500 hover:text-white/80 transition-colors inline-flex items-center gap-1.5 font-medium group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to TinyGrow storefront</span>
        </a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden" style={{ background: '#060B18' }}>

      {/* ── Deep background mesh gradient ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,113,133,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 0% 100%, rgba(56,189,248,0.08) 0%, transparent 60%), radial-gradient(ellipse 70% 70% at 100% 50%, rgba(167,139,250,0.07) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* ── Animated ambient blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(251,113,133,0.10) 0%, transparent 65%)',
            animation: 'adminBlob1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            bottom: '-12%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)',
            animation: 'adminBlob2 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)',
            animation: 'adminBlob3 9s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Subtle dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
        }}
      />

      {/* ── Floating sparkles ── */}
      {[
        { size: 5, top: '18%', left: '12%', delay: '0s', dur: '4s' },
        { size: 4, top: '72%', left: '8%', delay: '1.2s', dur: '5s' },
        { size: 6, top: '30%', right: '10%', delay: '0.6s', dur: '3.5s' },
        { size: 3, bottom: '20%', right: '15%', delay: '1.8s', dur: '4.5s' },
        { size: 4, top: '55%', left: '82%', delay: '0.3s', dur: '6s' },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: 'left' in s ? s.left : undefined,
            right: 'right' in s ? (s as { right?: string }).right : undefined,
            bottom: 'bottom' in s ? (s as { bottom?: string }).bottom : undefined,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#FB7185' : '#38BDF8',
            animation: `sparkle ${s.dur} ${s.delay} ease-in-out infinite`,
            boxShadow: `0 0 ${s.size * 2}px ${i % 2 === 0 ? '#FB7185' : '#38BDF8'}`,
          }}
        />
      ))}

      <style>{`
        @keyframes adminBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.06); }
          66% { transform: translate(-25px, 20px) scale(0.95); }
        }
        @keyframes adminBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-35px, 25px) scale(1.08); }
          66% { transform: translate(20px, -30px) scale(0.94); }
        }
        @keyframes adminBlob3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.12); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.6); }
        }
      `}</style>

      <Suspense
        fallback={
          <div className="relative z-10 w-full max-w-[440px] mx-5 rounded-[28px] p-10 flex flex-col items-center justify-center min-h-[480px] border border-white/5 shadow-2xl" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(40px)' }}>
            <Loader2 className="w-8 h-8 animate-spin text-[#FB7185]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
