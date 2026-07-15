import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowDown, Zap, Wind } from 'lucide-react';

interface PhysicsPreset {
  name: string;
  emoji: string;
  gravityForce: number;
  restitution: number;
  friction: number;
  description: string;
}

const PHYSICS_PRESETS: PhysicsPreset[] = [
  { name: 'Normal', emoji: '🌍', gravityForce: 0.5, restitution: 0.3, friction: 0.1, description: 'Standard earth gravity' },
  { name: 'Moon', emoji: '🌙', gravityForce: 0.1, restitution: 0.7, friction: 0.05, description: 'Low gravity, floaty jumps' },
  { name: 'Jupiter', emoji: '🪐', gravityForce: 1.2, restitution: 0.1, friction: 0.2, description: 'Heavy, hard to jump' },
  { name: 'Underwater', emoji: '🌊', gravityForce: 0.15, restitution: 0.1, friction: 0.3, description: 'Slow, draggy movement' },
  { name: 'Space', emoji: '🚀', gravityForce: 0, restitution: 0.9, friction: 0, description: 'Zero gravity, drift forever' },
  { name: 'Bouncy', emoji: '🏀', gravityForce: 0.5, restitution: 0.95, friction: 0.05, description: 'Everything bounces!' },
  { name: 'Ice', emoji: '🧊', gravityForce: 0.5, restitution: 0.2, friction: 0.01, description: 'Super slippery' },
  { name: 'Sticky', emoji: '🍯', gravityForce: 0.5, restitution: 0.05, friction: 0.8, description: 'Sticks to surfaces' },
];

export const PhysicsPlayground: React.FC = () => {
  const { spriteState, updateSpriteState } = useStore();
  const [gravityForce, setGravityForce] = useState(spriteState.gravityForce || 0.5);
  const [restitution, setRestitution] = useState(spriteState.restitution || 0.3);
  const [friction, setFriction] = useState(spriteState.friction || 0.1);

  const applyPreset = (preset: PhysicsPreset) => {
    setGravityForce(preset.gravityForce);
    setRestitution(preset.restitution);
    setFriction(preset.friction);
    updateSpriteState({
      gravityForce: preset.gravityForce,
      restitution: preset.restitution,
      friction: preset.friction,
    });
  };

  const applyCustom = () => {
    updateSpriteState({ gravityForce, restitution, friction });
  };

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physics Playground</div>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {PHYSICS_PRESETS.map(preset => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-violet-300 transition-all text-left"
          >
            <span className="text-xl">{preset.emoji}</span>
            <div>
              <div className="text-xs font-bold text-slate-700">{preset.name}</div>
              <div className="text-[10px] text-slate-400">{preset.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Controls */}
      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-xs font-bold text-slate-500 uppercase">Custom Physics</div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <ArrowDown size={12} /> Gravity
            </span>
            <span className="text-xs font-bold text-violet-600">{gravityForce.toFixed(2)}</span>
          </div>
          <input
            type="range"
            value={gravityForce}
            onChange={(e) => setGravityForce(parseFloat(e.target.value))}
            min={0}
            max={2}
            step={0.05}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <Zap size={12} /> Bounciness
            </span>
            <span className="text-xs font-bold text-violet-600">{restitution.toFixed(2)}</span>
          </div>
          <input
            type="range"
            value={restitution}
            onChange={(e) => setRestitution(parseFloat(e.target.value))}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <Wind size={12} /> Friction
            </span>
            <span className="text-xs font-bold text-violet-600">{friction.toFixed(2)}</span>
          </div>
          <input
            type="range"
            value={friction}
            onChange={(e) => setFriction(parseFloat(e.target.value))}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </div>

        <button
          onClick={applyCustom}
          className="w-full py-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Apply Custom Physics
        </button>
      </div>
    </div>
  );
};
