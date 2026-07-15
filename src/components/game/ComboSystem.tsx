import React, { useState, useEffect, useCallback } from 'react';

interface ComboSystemProps {
  kills: number;
  onComboChange?: (combo: number) => void;
}

export const ComboDisplay: React.FC<ComboSystemProps> = ({ kills, onComboChange }) => {
  const [combo, setCombo] = useState(0);
  const [lastKillTime, setLastKillTime] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  useEffect(() => {
    if (kills > 0) {
      const now = Date.now();
      if (now - lastKillTime < 2000) {
        setCombo(prev => prev + 1);
      } else {
        setCombo(1);
      }
      setLastKillTime(now);
      setShowCombo(true);
    }
  }, [kills]);

  useEffect(() => {
    if (combo > 0) {
      onComboChange?.(combo);
    }
  }, [combo, onComboChange]);

  useEffect(() => {
    if (showCombo) {
      const timer = setTimeout(() => setShowCombo(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCombo, combo]);

  if (!showCombo || combo < 2) return null;

  const getComboText = () => {
    if (combo >= 10) return { text: 'LEGENDARY!', color: 'text-yellow-400', size: 'text-4xl' };
    if (combo >= 7) return { text: 'UNSTOPPABLE!', color: 'text-orange-400', size: 'text-3xl' };
    if (combo >= 5) return { text: 'AMAZING!', color: 'text-red-400', size: 'text-3xl' };
    if (combo >= 3) return { text: 'NICE!', color: 'text-violet-400', size: 'text-2xl' };
    return { text: 'COMBO', color: 'text-blue-400', size: 'text-xl' };
  };

  const { text, color, size } = getComboText();

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 text-center pointer-events-none">
      <div className={`font-black ${size} ${color} drop-shadow-lg animate-bounce`} key={combo}>
        {text}
      </div>
      <div className="text-2xl font-black text-white drop-shadow-lg">
        x{combo}
      </div>
    </div>
  );
};
