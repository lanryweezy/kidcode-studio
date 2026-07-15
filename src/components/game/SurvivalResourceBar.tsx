import React from 'react';
import { Heart, Droplets, Sun, Moon } from 'lucide-react';

interface SurvivalResourceBarProps {
  hunger?: number;
  thirst?: number;
  health?: number;
  temperature?: number;
  timeOfDay?: 'day' | 'night';
  resources?: Record<string, number>;
}

export const SurvivalResourceBar: React.FC<SurvivalResourceBarProps> = React.memo(({
  hunger = 100,
  thirst = 100,
  health = 100,
  temperature = 37,
  timeOfDay = 'day',
  resources = {},
}) => {
  const hungerColor = hunger > 60 ? 'bg-green-500' : hunger > 30 ? 'bg-amber-500' : 'bg-red-500 animate-pulse';
  const thirstColor = thirst > 60 ? 'bg-blue-500' : thirst > 30 ? 'bg-cyan-500' : 'bg-red-500 animate-pulse';
  const tempColor = temperature > 35 && temperature < 39 ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="absolute top-4 left-4 z-40 pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700 p-3 space-y-1.5">
        {/* Health */}
        <div className="flex items-center gap-2">
          <Heart size={12} className="text-red-400" />
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${health}%` }} />
          </div>
          <span className="text-[10px] text-white font-mono w-6">{Math.round(health)}</span>
        </div>
        
        {/* Hunger */}
        <div className="flex items-center gap-2">
          <span className="text-xs">🍖</span>
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${hungerColor} rounded-full`} style={{ width: `${hunger}%` }} />
          </div>
          <span className="text-[10px] text-white font-mono w-6">{Math.round(hunger)}</span>
        </div>
        
        {/* Thirst */}
        <div className="flex items-center gap-2">
          <Droplets size={12} className="text-blue-400" />
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${thirstColor} rounded-full`} style={{ width: `${thirst}%` }} />
          </div>
          <span className="text-[10px] text-white font-mono w-6">{Math.round(thirst)}</span>
        </div>
        
        {/* Temperature */}
        <div className="flex items-center gap-2">
          <span className="text-xs">🌡️</span>
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${tempColor} rounded-full`} style={{ width: `${Math.min(100, (temperature / 50) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-white font-mono w-6">{temperature}°</span>
        </div>
        
        {/* Time of day */}
        <div className="flex items-center gap-1 pt-1 border-t border-slate-700">
          {timeOfDay === 'day' ? <Sun size={10} className="text-yellow-400" /> : <Moon size={10} className="text-blue-300" />}
          <span className="text-[10px] text-slate-300">{timeOfDay === 'day' ? 'Day' : 'Night'}</span>
        </div>
        
        {/* Resources */}
        {Object.keys(resources).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-700">
            {Object.entries(resources).map(([key, val]) => (
              <span key={key} className="text-[10px] text-slate-300 bg-slate-800 rounded px-1">
                {key}: {val}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
