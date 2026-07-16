import React, { useEffect, useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface SuccessFeedbackProps {
  show: boolean;
  message?: string;
  type?: 'success' | 'error' | 'warning';
  onComplete?: () => void;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({ show, message, type = 'success', onComplete }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);
  
  if (!visible) return null;
  
  const config = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: <Check size={20} className="text-white" />,
      defaultMsg: 'Success!'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-500',
      icon: <X size={20} className="text-white" />,
      defaultMsg: 'Error!'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      icon: <AlertTriangle size={20} className="text-white" />,
      defaultMsg: 'Warning!'
    },
  };

  const { bg, icon, defaultMsg } = config[type];
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${bg} text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm`}>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
          {icon}
        </div>
        <span className="font-bold text-sm">{message || defaultMsg}</span>
      </div>
    </div>
  );
};
