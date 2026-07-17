import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

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

const CONFETTI_COLORS = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#f87171'];

const spawnConfetti = () => {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;

    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${left}%;
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      animation-delay: ${delay}s;
      transform: rotate(${rotation}deg);
    `;
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 2500);
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-rose-500" />,
  info: <Info size={18} className="text-sky-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
};

const bgStyles: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50',
  error: 'border-rose-200 bg-gradient-to-r from-rose-50 to-red-50',
  info: 'border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50',
  warning: 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50',
};

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, type, message, isClosing: false }]);

    if (type === 'success') {
      spawnConfetti();
    }

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
              flex items-center gap-3 px-4 py-3
              border ${bgStyles[t.type]}
              rounded-xl shadow-lg
              max-w-sm backdrop-blur-sm
              ${t.isClosing ? 'toast-slide-out' : 'toast-slide-in'}
            `}
          >
            <div className="shrink-0">{icons[t.type]}</div>
            <span className="text-sm font-medium text-slate-700 flex-1">
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 text-slate-400 hover:text-slate-600 shrink-0"
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
