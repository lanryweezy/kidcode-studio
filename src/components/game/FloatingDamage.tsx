import React, { useState, useEffect, useCallback } from 'react';
import { Target, Skull, Trophy, Zap } from 'lucide-react';

// Legacy exports for backward compatibility
export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize?: string;
}

export const useDamageNumbers = () => {
  const [numbers, setNumbers] = useState<DamageNumber[]>([]);

  const addNumber = useCallback((x: number, y: number, text: string, color: string = '#ef4444', fontSize?: string) => {
    const id = `dmg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setNumbers(prev => [...prev, { id, x, y, text, color, fontSize }]);
  }, []);

  const removeNumber = useCallback((id: string) => {
    setNumbers(prev => prev.filter(n => n.id !== id));
  }, []);

  return { numbers, addNumber, removeNumber };
};

export const FloatingDamageNumbers: React.FC<{ numbers: DamageNumber[]; onRemove: (id: string) => void }> = ({
  numbers, onRemove
}) => {
  return (
    <>
      {numbers.map(num => (
        <FloatingDamageNumber
          key={num.id}
          x={num.x}
          y={num.y}
          damage={parseInt(num.text) || 0}
          isCritical={num.color === '#eab308'}
          isHeal={num.color === '#22c55e'}
          onComplete={() => onRemove(num.id)}
        />
      ))}
    </>
  );
};

// New RPG floating damage component

interface FloatingDamageProps {
  x: number;
  y: number;
  damage: number;
  isCritical: boolean;
  isHeal: boolean;
  onComplete: () => void;
}

export const FloatingDamageNumber: React.FC<FloatingDamageProps> = ({
  x, y, damage, isCritical, isHeal, onComplete
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const color = isHeal ? 'text-green-400' : isCritical ? 'text-yellow-400' : 'text-red-400';
  const size = isCritical ? 'text-xl font-black' : 'text-lg font-bold';

  return (
    <div
      className={`absolute pointer-events-none animate-bounce ${color} ${size} drop-shadow-lg`}
      style={{ left: x, top: y - 30, zIndex: 50 }}
    >
      {isHeal ? '+' : '-'}{damage}
      {isCritical && <span className="text-xs ml-1">CRIT!</span>}
    </div>
  );
};

interface WaveAnnouncerProps {
  waveNumber: number;
  totalWaves: number;
  isBossWave: boolean;
  bossName?: string;
}

export const WaveAnnouncer: React.FC<WaveAnnouncerProps> = ({
  waveNumber, totalWaves, isBossWave, bossName
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [waveNumber]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="text-center animate-pulse">
        {isBossWave ? (
          <>
            <Skull size={48} className="text-red-500 mx-auto mb-2 animate-bounce" />
            <div className="text-3xl font-black text-red-500 drop-shadow-lg">
              {bossName || 'BOSS'}
            </div>
            <div className="text-sm text-red-400 mt-1">PREPARE FOR BATTLE!</div>
          </>
        ) : (
          <>
            <Target size={36} className="text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white drop-shadow-lg">
              WAVE {waveNumber}/{totalWaves}
            </div>
            <div className="text-xs text-slate-400 mt-1">Enemies incoming!</div>
          </>
        )}
      </div>
    </div>
  );
};

interface LevelTransitionProps {
  fromLevel: string;
  toLevel: string;
  onComplete: () => void;
}

export const LevelTransition: React.FC<LevelTransitionProps> = ({
  fromLevel, toLevel, onComplete
}) => {
  const [phase, setPhase] = useState<'fadeOut' | 'showTitle' | 'fadeIn'>('fadeOut');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('showTitle'), 500);
    const t2 = setTimeout(() => setPhase('fadeIn'), 2000);
    const t3 = setTimeout(onComplete, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-100' : phase === 'fadeIn' ? 'opacity-0' : 'opacity-100'
      }`} />
      {phase === 'showTitle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
            <div className="text-4xl font-black text-white drop-shadow-lg mb-2">
              {toLevel}
            </div>
            <div className="text-sm text-slate-400">Level Complete!</div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DamagePopupProps {
  damage: number;
  x: number;
  y: number;
  type: 'physical' | 'magic' | 'heal' | 'critical';
  onComplete: () => void;
}

export const DamagePopup: React.FC<DamagePopupProps> = ({
  damage, x, y, type, onComplete
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const colors = {
    physical: 'text-red-400',
    magic: 'text-purple-400',
    heal: 'text-green-400',
    critical: 'text-yellow-400',
  };

  return (
    <div
      className={`absolute pointer-events-none font-black ${colors[type]} drop-shadow-lg ${
        type === 'critical' ? 'text-2xl' : 'text-lg'
      }`}
      style={{
        left: x + (Math.random() - 0.5) * 20,
        top: y - 20,
        animation: 'floatUp 0.8s ease-out forwards',
        zIndex: 50,
      }}
    >
      {type === 'heal' ? '+' : ''}{damage}{type === 'critical' ? '!' : ''}
    </div>
  );
};
