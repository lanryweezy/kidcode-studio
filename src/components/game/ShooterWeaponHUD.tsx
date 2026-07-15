import React from 'react';
import { Crosshair, RotateCcw, Shield } from 'lucide-react';

interface ShooterWeaponHUDProps {
  weapon?: string;
  ammo?: number;
  maxAmmo?: number;
  grenades?: number;
  inCover?: boolean;
}

export const ShooterWeaponHUD: React.FC<ShooterWeaponHUDProps> = React.memo(({
  weapon = 'Pistol',
  ammo = 30,
  maxAmmo = 30,
  grenades = 3,
  inCover = false,
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-40 pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700 p-3">
        {/* Weapon name */}
        <div className="flex items-center gap-2 mb-2">
          <Crosshair size={14} className="text-red-400" />
          <span className="text-xs font-bold text-white">{weapon}</span>
        </div>
        
        {/* Ammo bar */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-slate-300 w-8">AMMO</span>
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${ammo > maxAmmo * 0.3 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
              style={{ width: `${(ammo / maxAmmo) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-white w-8 text-right">{ammo}/{maxAmmo}</span>
        </div>
        
        {/* Grenades */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-300 w-8">FRAG</span>
          <div className="flex gap-0.5">
            {Array.from({ length: grenades }).map((_, i) => (
              <span key={i} className="text-xs">💣</span>
            ))}
          </div>
        </div>
        
        {/* Cover indicator */}
        {inCover && (
          <div className="flex items-center gap-1 mt-2 bg-green-900/50 rounded px-2 py-0.5">
            <Shield size={10} className="text-green-400" />
            <span className="text-[10px] font-bold text-green-400">IN COVER</span>
          </div>
        )}
      </div>
    </div>
  );
});
