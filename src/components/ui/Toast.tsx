import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  isClosing: boolean;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <PartyPopper size={24} className="text-emerald-500 animate-bounce" />,
  error: <AlertCircle size={24} className="text-rose-500 animate-pulse" />,
  info: <Info size={24} className="text-sky-500" />,
  warning: <AlertTriangle size={24} className="text-amber-500 animate-pulse" />,
};

const bgStyles: Record<ToastType, string> = {
  success: 'border-emerald-400 bg-emerald-50 shadow-emerald-500/20',
  error: 'border-rose-400 bg-rose-50 shadow-rose-500/20',
  info: 'border-sky-400 bg-sky-50 shadow-sky-500/20',
  warning: 'border-amber-400 bg-amber-50 shadow-amber-500/20',
};

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++toastCounter}`;
    if (type === 'success') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.2, x: 0.9 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
      });
    }
    setToasts((prev) => [...prev, { id, type, message, isClosing: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map(t => t.id === id ? { ...t, isClosing: true } : t));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3700);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, isClosing: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-toast flex flex-col gap-2 pointer-events-none" role="log" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`
              pointer-events-auto
              flex items-center gap-4 px-5 py-4
              border-2 ${bgStyles[t.type]}
              rounded-2xl shadow-xl transform-gpu
              max-w-sm w-full
              ${t.isClosing ? 'toast-slide-out opacity-0 translate-x-full' : 'toast-slide-in animate-in slide-in-from-right-full bounce-in'}
            `}
          >
            <div className="shrink-0 drop-shadow-md">
              {icons[t.type]}
            </div>
            <span className="text-base font-bold text-slate-800 flex-1 leading-snug">
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
