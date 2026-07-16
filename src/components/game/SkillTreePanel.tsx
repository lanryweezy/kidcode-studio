import React, { useState } from 'react';
import { Star, Lock, Check, Zap, Shield, Wind, Sparkles } from 'lucide-react';
import { SKILL_TREE, SkillNode, unlockSkill } from '../../services/rpgSystemsExtended';
import { SpriteState } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface SkillTreePanelProps {
  state: SpriteState;
  onUnlock: (skillId: string) => void;
  onClose: () => void;
}

const CATEGORY_CONFIG = {
  offensive: { label: 'Offensive', icon: <Zap size={14} />, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  defensive: { label: 'Defensive', icon: <Shield size={14} />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  utility: { label: 'Utility', icon: <Wind size={14} />, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
};

export const SkillTreePanel: React.FC<SkillTreePanelProps> = ({
  state, onUnlock, onClose
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');

  const skillPoints = (state.variables.skillPoints as number) || 0;
  const unlockedSkills = (state.variables.unlockedSkills as string[]) || [];

  const categories = ['all', 'offensive', 'defensive', 'utility'];
  const filteredSkills = category === 'all'
    ? SKILL_TREE
    : SKILL_TREE.filter(s => s.category === category);

  const selected = SKILL_TREE.find(s => s.id === selectedSkill);

  const isUnlocked = (id: string) => unlockedSkills.includes(id);
  const canUnlock = (skill: SkillNode) => {
    if (isUnlocked(skill.id)) return false;
    if (skillPoints < skill.cost) return false;
    return skill.requires.every(r => isUnlocked(r));
  };

  const getSkillConnections = () => {
    const connections: { from: string; to: string }[] = [];
    for (const skill of SKILL_TREE) {
      for (const req of skill.requires) {
        connections.push({ from: req, to: skill.id });
      }
    }
    return connections;
  };

  const connections = getSkillConnections();

  return (
    <Modal open={true} onClose={onClose} title="Skill Tree" size="lg">
      <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[480px]">
        {/* Left: Skill Tree */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Skill Points */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400" fill="currentColor" />
              <span className="text-sm font-bold text-slate-700">
                {skillPoints} Skill Points
              </span>
            </div>
            <div className="flex gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    category === cat
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Grid by Category */}
          {(['offensive', 'defensive', 'utility'] as const).map(cat => {
            const catSkills = filteredSkills.filter(s => s.category === cat);
            if (catSkills.length === 0) return null;
            const config = CATEGORY_CONFIG[cat];

            return (
              <div key={cat} className={`rounded-xl p-3 border ${config.bg} ${config.border}`}>
                <div className={`flex items-center gap-1 mb-2 ${config.color}`}>
                  {config.icon}
                  <span className="text-xs font-bold uppercase">{config.label}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {catSkills.map(skill => {
                    const unlocked = isUnlocked(skill.id);
                    const available = canUnlock(skill);
                    const locked = !unlocked && !available;

                    return (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill.id)}
                        className={`relative w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all ${
                          unlocked
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg scale-105'
                            : available
                              ? 'bg-white border-2 border-violet-400 hover:scale-105 animate-pulse'
                              : locked
                                ? 'bg-slate-200 opacity-50'
                                : 'bg-slate-100'
                        }`}
                      >
                        {unlocked ? (
                          <Check size={16} className="mb-0.5" />
                        ) : locked ? (
                          <Lock size={14} className="mb-0.5 text-slate-400" />
                        ) : (
                          <span className="text-lg mb-0.5">{skill.icon}</span>
                        )}
                        <span className="text-[8px] font-bold leading-tight text-center px-1">
                          {skill.name}
                        </span>

                        {/* Connection lines */}
                        {skill.requires.length > 0 && (
                          <div className="absolute -top-1 left-1/2 w-0.5 h-1 bg-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Skill Detail */}
        {selected ? (
          <div className="w-56 border-l border-slate-200 pl-4 space-y-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl ${
                isUnlocked(selected.id)
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                                     : 'bg-slate-100'
              }`}>
                {isUnlocked(selected.id) ? '✓' : selected.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-3">{selected.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{selected.description}</p>
            </div>

            {/* Requirements */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Requirements</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cost</span>
                  <span className="font-bold text-yellow-500">{selected.cost} SP</span>
                </div>
                {selected.requires.map(reqId => {
                  const req = SKILL_TREE.find(s => s.id === reqId);
                  return (
                    <div key={reqId} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Requires</span>
                      <span className={`font-bold ${isUnlocked(reqId) ? 'text-green-500' : 'text-red-500'}`}>
                        {isUnlocked(reqId) ? '✓' : '✗'} {req?.name || reqId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Effect */}
            <div className="p-2 bg-violet-50 rounded-lg">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Effect</div>
              <div className="text-xs text-violet-700">
                {selected.effect.type}: +{selected.effect.value}
              </div>
            </div>

            {/* Unlock Button */}
            {isUnlocked(selected.id) ? (
              <div className="text-center py-2 text-green-500 text-sm font-bold">
                ✓ Unlocked
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => onUnlock(selected.id)}
                disabled={!canUnlock(selected)}
                className="w-full"
              >
                Unlock ({selected.cost} SP)
              </Button>
            )}
          </div>
        ) : (
          <div className="w-56 border-l border-slate-200 pl-4 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a skill</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SkillTreePanel;
