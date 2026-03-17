import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, Award } from 'lucide-react';

export interface XPNotificationData {
  amount: number;
  reason: string;
  icon?: 'star' | 'trophy' | 'trend';
}

interface XPNotificationProps {
  notification: XPNotificationData;
  onComplete: () => void;
}

export const XPNotification: React.FC<XPNotificationProps> = ({
  notification,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => setProgress(100), 100);
    
    // Auto-dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for exit animation
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [onComplete]);

  const getIcon = () => {
    switch (notification.icon) {
      case 'trophy':
        return <Award size={20} className="text-yellow-400" />;
      case 'trend':
        return <TrendingUp size={20} className="text-green-400" />;
      default:
        return <Star size={20} className="text-yellow-400 fill-yellow-400" />;
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-[300] 
        bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900
        border border-yellow-500/30 rounded-2xl shadow-2xl
        overflow-hidden transition-all duration-300
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
      style={{ minWidth: '320px' }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative p-4 flex items-center gap-3">
        {/* Icon with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-lg animate-pulse"></div>
          <div className="relative bg-slate-800 rounded-full p-2.5 border border-yellow-500/30">
            {getIcon()}
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-2xl font-black text-yellow-400">
              +{notification.amount} XP
            </span>
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
              NICE!
            </span>
          </div>
          <p className="text-slate-300 text-sm font-medium truncate">
            {notification.reason}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-slate-800">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Hook to manage XP notifications
export const useXPNotifications = () => {
  const [notifications, setNotifications] = useState<XPNotificationData[]>([]);

  const addXPNotification = (amount: number, reason: string, icon?: 'star' | 'trophy' | 'trend') => {
    setNotifications(prev => [...prev, { amount, reason, icon }]);
  };

  const removeXPNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    notifications,
    addXPNotification,
    removeXPNotification
  };
};

export default XPNotification;
