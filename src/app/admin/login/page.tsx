'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
      );
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
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#0F172A]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #FB7185 0%, transparent 70%)',
            animation: mounted ? 'blob1 8s ease-in-out infinite' : 'none',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #38BDF8 0%, transparent 70%)',
            animation: mounted ? 'blob2 10s ease-in-out infinite' : 'none',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 10px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 15px) scale(1.08); }
          66% { transform: translate(15px, -25px) scale(0.93); }
        }
      `}</style>

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-4"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* Glassmorphism card */}
        <div
          className="rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Logo / Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FB7185] to-[#F43F5E] flex items-center justify-center text-3xl shadow-xl shadow-pink-500/30 mb-4">
              🌱
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              TinyGrow Admin
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secure store management portal
            </p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-sm text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email field */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tinygrow.com"
                  className="w-full bg-white/5 text-white text-sm rounded-xl py-3 pl-11 pr-4 border border-white/10 placeholder-slate-500 focus:outline-none focus:border-[#FB7185]/60 focus:bg-white/10 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-white/5 text-white text-sm rounded-xl py-3 pl-11 pr-11 border border-white/10 placeholder-slate-500 focus:outline-none focus:border-[#FB7185]/60 focus:bg-white/10 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
              className="mt-2 w-full bg-gradient-to-r from-[#FB7185] to-[#F43F5E] hover:from-[#F43F5E] hover:to-[#E11D48] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-pink-500/25 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-600 mt-6">
            Use your Supabase account credentials to access the admin panel.
          </p>
        </div>

        {/* Back to store link */}
        <div className="text-center mt-5">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            ← Back to TinyGrow storefront
          </a>
        </div>
      </div>
    </div>
  );
}
