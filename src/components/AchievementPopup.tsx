import React from 'react';
import { Achievement, getNextAchievement, hasPendingAchievements } from '../services/achievementService';
import { playSoundEffect } from '../services/soundService';

const RARITY_STYLES: Record<string, { border: string; bg: string; glow: string }> = {
  common: { border: 'border-slate-400', bg: 'bg-slate-50', glow: '' },
  uncommon: { border: 'border-emerald-400', bg: 'bg-emerald-50', glow: '' },
  rare: { border: 'border-blue-400', bg: 'bg-blue-50', glow: '' },
  epic: { border: 'border-purple-400', bg: 'bg-purple-50', glow: '' },
  legendary: { border: 'border-yellow-400', bg: 'bg-yellow-50', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.5)]' },
};

const AchievementPopup: React.FC = () => {
  const [current, setCurrent] = React.useState<Achievement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!current && hasPendingAchievements()) {
        const next = getNextAchievement();
        if (next) {
          setCurrent(next);
          setVisible(true);
          setExiting(false);
          playSoundEffect('achievement');

          setTimeout(() => {
            setExiting(true);
            setTimeout(() => {
              setVisible(false);
              setCurrent(null);
              setExiting(false);
            }, 400);
          }, 4000);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [current]);

  if (!visible || !current) return null;

  const style = RARITY_STYLES[current.rarity] || RARITY_STYLES.common;

  return (
    <div
      className={`fixed top-20 right-4 z-[100] transition-all duration-400 ${
        exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div
        className={`flex items-center gap-4 px-5 py-4 rounded-2xl ${style.border} border-2 ${style.bg} shadow-xl ${style.glow} max-w-sm backdrop-blur-sm`}
      >
        <div className="text-4xl animate-bounce">{current.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {current.rarity}
            </span>
          </div>
          <h4 className="font-black text-slate-800 text-sm leading-tight">{current.name}</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-tight">{current.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              +{current.xpReward} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AchievementPopup);
