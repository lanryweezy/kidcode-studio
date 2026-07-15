import React from 'react';
import { Zap, Timer, Flag, Fuel, Gauge } from 'lucide-react';

interface RacingHUDProps {
  speed?: number;
  maxSpeed?: number;
  laps?: number;
  totalLaps?: number;
  position?: number;
  boostFuel?: number;
  lapTime?: string;
  bestLap?: string;
}

export const RacingHUD: React.FC<RacingHUDProps> = React.memo(({
  speed = 0,
  maxSpeed = 300,
  laps = 0,
  totalLaps = 3,
  position = 1,
  boostFuel = 100,
  lapTime = '0:00.000',
  bestLap = '--:--:---',
}) => {
  const speedPercent = Math.min(100, (speed / maxSpeed) * 100);
  const speedColor = speedPercent > 80 ? 'text-red-400' : speedPercent > 50 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700 px-6 py-3 flex items-center gap-6">
        {/* Speed */}
        <div className="text-center">
          <div className="flex items-center gap-1">
            <Gauge size={12} className={speedColor} />
            <span className="text-[10px] text-slate-400">SPEED</span>
          </div>
          <div className={`text-2xl font-black font-mono ${speedColor}`}>{Math.round(speed)}</div>
          <div className="text-[10px] text-slate-500">km/h</div>
        </div>

        {/* Position */}
        <div className="text-center">
          <div className="flex items-center gap-1">
            <Flag size={12} className="text-yellow-400" />
            <span className="text-[10px] text-slate-400">POS</span>
          </div>
          <div className="text-2xl font-black text-white">{position}</div>
          <div className="text-[10px] text-slate-500">/ 8</div>
        </div>

        {/* Laps */}
        <div className="text-center">
          <div className="flex items-center gap-1">
            <Timer size={12} className="text-cyan-400" />
            <span className="text-[10px] text-slate-400">LAP</span>
          </div>
          <div className="text-2xl font-black text-white">{laps}<span className="text-sm text-slate-500">/{totalLaps}</span></div>
        </div>

        {/* Boost */}
        <div className="text-center">
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-orange-400" />
            <span className="text-[10px] text-slate-400">BOOST</span>
          </div>
          <div className="w-16 h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full" style={{ width: `${boostFuel}%` }} />
          </div>
        </div>

        {/* Lap Time */}
        <div className="text-center">
          <div className="text-[10px] text-slate-400">TIME</div>
          <div className="text-sm font-mono font-bold text-white">{lapTime}</div>
          <div className="text-[10px] text-slate-500">Best: {bestLap}</div>
        </div>
      </div>
    </div>
  );
});
