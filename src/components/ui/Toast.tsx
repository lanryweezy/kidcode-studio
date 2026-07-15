import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
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
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-rose-500" />,
  info: <Info size={18} className="text-sky-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
};

const bgStyles: Record<ToastType, string> = {
  success: 'border-emerald-200',
  error: 'border-rose-200',
  info: 'border-sky-200',
  warning: 'border-amber-200',
};

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
              bg-white
              border ${bgStyles[t.type]}
              rounded-xl shadow-glass-lg
              animate-slide-in
              max-w-sm
            `}
          >
            {icons[t.type]}
            <span className="text-sm font-medium text-slate-700 flex-1">
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
