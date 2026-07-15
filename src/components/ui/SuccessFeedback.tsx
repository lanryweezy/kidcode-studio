import React, { useEffect, useState } from 'react';

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
  
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className={`${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {message || (type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Warning!')}
      </div>
    </div>
  );
};
