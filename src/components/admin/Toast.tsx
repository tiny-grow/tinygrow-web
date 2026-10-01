'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Mount animation
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const dismissTimer = setTimeout(() => handleClose(), duration);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose(), 350);
  };

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      bar: 'bg-emerald-400',
      ring: 'ring-emerald-500/30',
      bg: 'bg-[#0f2a1e]',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      bar: 'bg-rose-400',
      ring: 'ring-rose-500/30',
      bg: 'bg-[#2a0f0f]',
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
      bar: 'bg-sky-400',
      ring: 'ring-sky-500/30',
      bg: 'bg-[#0f1f2a]',
    },
  }[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: 'auto',
      }}
      className={`relative flex items-start gap-3 min-w-[300px] max-w-[420px] px-4 py-3.5 rounded-2xl shadow-2xl ring-1 ${config.ring} ${config.bg} overflow-hidden`}
    >
      {/* Animated left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar} rounded-l-2xl`} />

      {/* Animated progress shrink */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] ${config.bar} opacity-40`}
        style={{
          animation: `toast-shrink ${duration}ms linear forwards`,
        }}
      />

      {config.icon}
      <p className="text-sm text-white/90 font-medium leading-snug flex-1 pl-1">{message}</p>
      <button
        onClick={handleClose}
        className="text-white/40 hover:text-white/80 transition-colors mt-0.5 shrink-0"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

/* ─── Toast Container ─────────────────────────────────────────────────────── */

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  );
}

/* ─── Hook ────────────────────────────────────────────────────────────────── */

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
