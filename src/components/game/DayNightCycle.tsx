import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

interface TimePreset {
  name: string;
  emoji: string;
  hour: number;
  skyColor: string;
  ambientColor: string;
  ambientIntensity: number;
}

const TIME_PRESETS: TimePreset[] = [
  { name: 'Dawn', emoji: '🌅', hour: 6, skyColor: '#ff9a56', ambientColor: '#ffcc80', ambientIntensity: 0.6 },
  { name: 'Morning', emoji: '☀️', hour: 9, skyColor: '#87ceeb', ambientColor: '#ffffff', ambientIntensity: 1.0 },
  { name: 'Noon', emoji: '🌞', hour: 12, skyColor: '#4fc3f7', ambientColor: '#ffffff', ambientIntensity: 1.2 },
  { name: 'Afternoon', emoji: '🌤️', hour: 15, skyColor: '#64b5f6', ambientColor: '#fff9c4', ambientIntensity: 1.0 },
  { name: 'Sunset', emoji: '🌇', hour: 18, skyColor: '#ff7043', ambientColor: '#ffab91', ambientIntensity: 0.7 },
  { name: 'Dusk', emoji: '🌆', hour: 20, skyColor: '#5c6bc0', ambientColor: '#9fa8da', ambientIntensity: 0.5 },
  { name: 'Night', emoji: '🌙', hour: 22, skyColor: '#1a237e', ambientColor: '#5c6bc0', ambientIntensity: 0.3 },
  { name: 'Midnight', emoji: '🌑', hour: 0, skyColor: '#0d1b2a', ambientColor: '#1b2838', ambientIntensity: 0.2 },
];

export const DayNightCycle: React.FC = () => {
  const { spriteState, updateSpriteState } = useStore();
  const [currentHour, setCurrentHour] = useState(spriteState.lighting?.ambientIntensity !== undefined ? 12 : 12);
  const [cycleSpeed, setCycleSpeed] = useState(1);
  const [isCycling, setIsCycling] = useState(false);

  const getPresetForHour = (hour: number) => {
    return TIME_PRESETS.reduce((prev, curr) => {
      return Math.abs(curr.hour - hour) < Math.abs(prev.hour - hour) ? curr : prev;
    });
  };

  const currentPreset = getPresetForHour(currentHour);

  const applyPreset = (preset: TimePreset) => {
    setCurrentHour(preset.hour);
    updateSpriteState({
      lighting: {
        ...spriteState.lighting,
        ambientColor: preset.ambientColor,
        ambientIntensity: preset.ambientIntensity,
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day / Night Cycle</div>

      {/* Sky Preview */}
      <div
        className="h-24 rounded-xl flex items-center justify-center transition-all duration-500 relative overflow-hidden"
        style={{ backgroundColor: currentPreset.skyColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <span className="text-5xl relative z-10 drop-shadow-lg">{currentPreset.emoji}</span>
        <div className="absolute bottom-2 left-3 text-xs font-bold text-white/80 relative z-10">
          {currentPreset.name} — {currentHour}:00
        </div>
      </div>

      {/* Time Slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Time of Day</span>
          <span className="text-xs font-bold text-violet-600">{currentHour}:00</span>
        </div>
        <div className="relative">
          <input
            type="range"
            value={currentHour}
            onChange={(e) => {
              const hour = parseInt(e.target.value);
              setCurrentHour(hour);
              const preset = getPresetForHour(hour);
              updateSpriteState({
                lighting: {
                  ...spriteState.lighting,
                  ambientColor: preset.ambientColor,
                  ambientIntensity: preset.ambientIntensity,
                }
              });
            }}
            min={0}
            max={23}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0:00</span>
            <span>6:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>

      {/* Time Presets */}
      <div className="grid grid-cols-4 gap-1">
        {TIME_PRESETS.map(preset => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all ${
              currentPreset.name === preset.name
                ? 'bg-violet-100 border border-violet-300 scale-105'
                : 'bg-slate-50 border border-transparent hover:border-slate-200'
            }`}
          >
            <span className="text-lg">{preset.emoji}</span>
            <span className="font-bold text-slate-600">{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Cycle Controls */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-500 uppercase">Auto Cycle</div>
          <button
            onClick={() => setIsCycling(!isCycling)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isCycling
                ? 'bg-violet-500 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isCycling ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Speed:</span>
          <input
            type="range"
            value={cycleSpeed}
            onChange={(e) => setCycleSpeed(parseFloat(e.target.value))}
            min={0.1}
            max={5}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs font-bold text-violet-600">{cycleSpeed.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};
