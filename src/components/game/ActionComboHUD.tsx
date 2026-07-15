import React, { useEffect, useState } from 'react';

interface ActionComboHUDProps {
  combo: number;
  weapon?: string;
  stamina?: number;
  specialReady?: boolean;
}

export const ActionComboHUD: React.FC<ActionComboHUDProps> = ({ combo, weapon, stamina, specialReady }) => {
  const [showCombo, setShowCombo] = useState(false);
  
  useEffect(() => {
    if (combo > 0) {
      setShowCombo(true);
      const t = setTimeout(() => setShowCombo(false), 1500);
      return () => clearTimeout(t);
    }
  }, [combo]);

  return (
    <div className="absolute bottom-4 left-4 z-40 pointer-events-none">
      {showCombo && combo > 0 && (
        <div className="bg-red-900/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-500/50 animate-pulse">
          <div className="text-white font-black text-2xl">{combo}x COMBO!</div>
        </div>
      )}
      {weapon && (
        <div className="mt-2 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-slate-700">
          <span className="text-xs text-slate-400">Weapon:</span>
          <span className="text-sm font-bold text-white ml-1">{weapon}</span>
        </div>
      )}
      {stamina !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-yellow-400 text-xs">⚡</span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${stamina}%` }} />
          </div>
        </div>
      )}
      {specialReady && (
        <div className="mt-2 bg-purple-900/80 rounded-lg px-3 py-1 border border-purple-500/50">
          <span className="text-xs font-bold text-purple-300">🔥 SPECIAL READY!</span>
        </div>
      )}
    </div>
  );
};
