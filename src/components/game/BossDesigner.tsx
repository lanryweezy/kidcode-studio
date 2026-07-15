import React, { useState } from 'react';
import { Heart, Swords, Shield, Zap, Clock, Target } from 'lucide-react';

interface BossPhase {
  name: string;
  healthThreshold: number;
  attacks: string[];
  speed: number;
}

interface BossDesignerProps {
  onSave: (boss: { name: string; emoji: string; phases: BossPhase[]; hp: number }) => void;
}

const BOSS_EMOJIS = ['🐉', '👾', '👹', '💀', '🦾', '🦁', '🐺', '🤖'];

const ATTACK_TYPES = [
  { id: 'charge', label: 'Charge', emoji: '💨' },
  { id: 'fireball', label: 'Fireball', emoji: '🔥' },
  { id: 'laser', label: 'Laser', emoji: ' beam' },
  { id: 'slam', label: 'Ground Slam', emoji: '💥' },
  { id: 'spawn', label: 'Spawn Minions', emoji: '👾' },
  { id: 'shield', label: 'Shield Up', emoji: '🛡️' },
  { id: 'heal', label: 'Self Heal', emoji: '💚' },
  { id: 'teleport', label: 'Teleport', emoji: '🌀' },
];

export const BossDesigner: React.FC<BossDesignerProps> = ({ onSave }) => {
  const [bossName, setBossName] = useState('Dragon Lord');
  const [bossEmoji, setBossEmoji] = useState('🐉');
  const [bossHp, setBossHp] = useState(100);
  const [phases, setPhases] = useState<BossPhase[]>([
    { name: 'Phase 1', healthThreshold: 100, attacks: ['charge'], speed: 1 },
    { name: 'Phase 2', healthThreshold: 60, attacks: ['fireball', 'charge'], speed: 1.5 },
    { name: 'Phase 3', healthThreshold: 30, attacks: ['fireball', 'laser', 'teleport'], speed: 2 },
  ]);

  const addPhase = () => {
    const lastPhase = phases[phases.length - 1];
    setPhases([...phases, {
      name: `Phase ${phases.length + 1}`,
      healthThreshold: Math.max(10, lastPhase.healthThreshold - 25),
      attacks: ['charge'],
      speed: lastPhase.speed + 0.5,
    }]);
  };

  const updatePhase = (index: number, updates: Partial<BossPhase>) => {
    setPhases(phases.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const toggleAttack = (phaseIndex: number, attackId: string) => {
    const phase = phases[phaseIndex];
    const attacks = phase.attacks.includes(attackId)
      ? phase.attacks.filter(a => a !== attackId)
      : [...phase.attacks, attackId];
    updatePhase(phaseIndex, { attacks });
  };

  return (
    <div className="space-y-4">
      {/* Boss Preview */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
        <div className="text-5xl">{bossEmoji}</div>
        <div className="flex-1">
          <input
            type="text"
            value={bossName}
            onChange={(e) => setBossName(e.target.value)}
            className="text-lg font-bold bg-transparent border-none outline-none text-slate-800 w-full"
          />
          <div className="flex items-center gap-2 mt-1">
            <Heart size={12} className="text-red-500" />
            <input
              type="number"
              value={bossHp}
              onChange={(e) => setBossHp(parseInt(e.target.value) || 100)}
              className="w-16 px-2 py-0.5 text-xs rounded border border-red-200 bg-white"
            />
            <span className="text-xs text-slate-500">HP</span>
          </div>
        </div>
      </div>

      {/* Boss Emoji Selector */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Boss Appearance</div>
        <div className="flex gap-1">
          {BOSS_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => setBossEmoji(emoji)}
              className={`text-2xl p-1.5 rounded-lg transition-all ${
                bossEmoji === emoji
                  ? 'bg-red-100 border-2 border-red-400 scale-110'
                  : 'bg-slate-100 border-2 border-transparent hover:border-slate-300'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Battle Phases</div>
          <button onClick={addPhase} className="text-xs text-violet-500 hover:text-violet-600 font-bold">+ Add Phase</button>
        </div>

        <div className="space-y-3">
          {phases.map((phase, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={phase.name}
                  onChange={(e) => updatePhase(i, { name: e.target.value })}
                  className="text-sm font-bold bg-transparent border-none outline-none text-slate-700"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Speed:</span>
                  <input
                    type="number"
                    value={phase.speed}
                    onChange={(e) => updatePhase(i, { speed: parseFloat(e.target.value) || 1 })}
                    step={0.1}
                    min={0.5}
                    max={5}
                    className="w-12 px-1 py-0.5 text-xs rounded border border-slate-200 bg-white text-center"
                  />
                </div>
              </div>

              {/* HP Threshold */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-slate-400">Activates at:</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                    style={{ width: `${phase.healthThreshold}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  <input
                    type="range"
                    value={phase.healthThreshold}
                    onChange={(e) => updatePhase(i, { healthThreshold: parseInt(e.target.value) })}
                    min={5}
                    max={100}
                    className="w-20"
                  />
                </span>
              </div>

              {/* Attacks */}
              <div className="flex flex-wrap gap-1">
                {ATTACK_TYPES.map(attack => (
                  <button
                    key={attack.id}
                    onClick={() => toggleAttack(i, attack.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      phase.attacks.includes(attack.id)
                        ? 'bg-red-100 text-red-600 border border-red-300'
                        : 'bg-slate-100 text-slate-500 border border-transparent hover:border-slate-300'
                    }`}
                  >
                    {attack.emoji} {attack.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSave({ name: bossName, emoji: bossEmoji, phases, hp: bossHp })}
        className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Save Boss Design
      </button>
    </div>
  );
};
