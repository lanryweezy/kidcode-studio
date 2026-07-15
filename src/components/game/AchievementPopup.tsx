import React, { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement || !visible) return null;

  return (
    <div className="absolute top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {achievement.emoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Trophy size={12} className="text-yellow-200" />
              <span className="text-[10px] font-bold text-yellow-200 uppercase">Achievement Unlocked</span>
            </div>
            <div className="text-sm font-bold text-white">{achievement.name}</div>
            <div className="text-xs text-white/80">{achievement.description}</div>
          </div>
          <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="text-white/60 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
