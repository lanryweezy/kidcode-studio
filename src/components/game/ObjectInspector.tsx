import React, { useState } from 'react';
import { X, Palette, Music, Swords, Brain, Zap, Eye, MapPin, Heart, Shield, Target, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface GameObject {
  id: string;
  name: string;
  emoji: string;
  type: 'player' | 'enemy' | 'npc' | 'item' | 'tile' | 'trigger' | 'projectile';
  x: number;
  y: number;
  properties: Record<string, string | number | boolean>;
}

interface ObjectInspectorProps {
  object: GameObject | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<GameObject>) => void;
  onDelete: (id: string) => void;
}

type InspectorTab = 'position' | 'appearance' | 'behavior' | 'stats' | 'effects';

const TABS: { id: InspectorTab; label: string; icon: React.ReactNode }[] = [
  { id: 'position', label: 'Pos', icon: <MapPin size={14} /> },
  { id: 'appearance', label: 'Look', icon: <Palette size={14} /> },
  { id: 'behavior', label: 'AI', icon: <Brain size={14} /> },
  { id: 'stats', label: 'Stats', icon: <Heart size={14} /> },
  { id: 'effects', label: 'FX', icon: <Zap size={14} /> },
];

const EMOJI_OPTIONS = [
  '🚀', '👾', '💀', '👺', '👻', '🗿', '🧙', '🐉', '🐺', '📦',
  '🪙', '❤️', '🛡️', '⚔️', '🔑', '⭐', '🔥', '❄️', '⚡', '💚',
  '🚩', '🌀', '💾', '🚪', '🪜', '🧱', '🟩', '🟦', '🟥', '⬛',
];

const ENEMY_BEHAVIORS = ['patrol', 'chase', 'fly', 'shoot', 'explode', 'teleport', 'shield', 'summon'];

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({ object, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('position');

  if (!object) return null;

  const updateProp = (key: string, value: string | number | boolean) => {
    onUpdate(object.id, { properties: { ...object.properties, [key]: value } });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{object.emoji}</span>
          <div>
            <input
              type="text"
              value={object.name}
              onChange={(e) => onUpdate(object.id, { name: e.target.value })}
              className="font-bold text-sm bg-transparent border-none outline-none text-slate-800 w-32"
            />
            <div className="text-[10px] text-slate-400 uppercase">{object.type}</div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onDelete(object.id)} className="text-red-500 hover:text-red-600">
            <Trash2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-colors ${
              activeTab === tab.id
                ? 'text-violet-600 border-b-2 border-violet-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'position' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">Position</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">X</label>
                <input
                  type="number"
                  value={object.x}
                  onChange={(e) => onUpdate(object.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Y</label>
                <input
                  type="number"
                  value={object.y}
                  onChange={(e) => onUpdate(object.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Quick Position</div>
              <div className="grid grid-cols-3 gap-1">
                {['Top Left', 'Center', 'Bottom Right', 'Top Center', 'Bottom Center'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => {
                      const positions: Record<string, { x: number; y: number }> = {
                        'Top Left': { x: 50, y: 50 },
                        'Center': { x: 400, y: 300 },
                        'Bottom Right': { x: 750, y: 550 },
                        'Top Center': { x: 400, y: 50 },
                        'Bottom Center': { x: 400, y: 550 },
                      };
                      onUpdate(object.id, positions[pos]);
                    }}
                    className="px-2 py-1 text-[10px] bg-white rounded border border-slate-200 hover:border-violet-300 transition-colors"
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">Appearance</div>
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onUpdate(object.id, { emoji })}
                  className={`text-xl p-2 rounded-lg transition-all ${
                    object.emoji === emoji
                      ? 'bg-violet-100 border-2 border-violet-400 scale-110'
                      : 'bg-slate-100 border-2 border-transparent hover:border-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Custom Emoji</label>
              <input
                type="text"
                value={object.emoji}
                onChange={(e) => onUpdate(object.id, { emoji: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-2xl text-center"
                placeholder="Enter emoji..."
              />
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">AI Behavior</div>
            <div className="grid grid-cols-2 gap-1">
              {ENEMY_BEHAVIORS.map(behavior => (
                <button
                  key={behavior}
                  onClick={() => updateProp('behavior', behavior)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    object.properties.behavior === behavior
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {behavior}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Speed</label>
              <input
                type="range"
                value={Number(object.properties.speed) || 1}
                onChange={(e) => updateProp('speed', parseFloat(e.target.value))}
                min={0}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-violet-600 text-right">{object.properties.speed || 1}x</div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Range</label>
              <input
                type="number"
                value={Number(object.properties.range) || 100}
                onChange={(e) => updateProp('range', parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">Stats</div>
            <div className="space-y-2">
              {[
                { key: 'health', label: 'Health', icon: <Heart size={12} className="text-red-500" />, max: 200 },
                { key: 'damage', label: 'Damage', icon: <Swords size={12} className="text-orange-500" />, max: 50 },
                { key: 'defense', label: 'Defense', icon: <Shield size={12} className="text-blue-500" />, max: 50 },
                { key: 'xpReward', label: 'XP Reward', icon: <Zap size={12} className="text-yellow-500" />, max: 100 },
              ].map(stat => (
                <div key={stat.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">{stat.icon} {stat.label}</span>
                    <span className="text-xs font-bold text-violet-600">{object.properties[stat.key] || 0}</span>
                  </div>
                  <input
                    type="range"
                    value={Number(object.properties[stat.key]) || 0}
                    onChange={(e) => updateProp(stat.key, parseInt(e.target.value))}
                    min={0}
                    max={stat.max}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase">Effects</div>
            <div className="space-y-2">
              {[
                { key: 'glow', label: 'Glow', emoji: '✨' },
                { key: 'trail', label: 'Trail', emoji: '💨' },
                { key: 'particle', label: 'Particles', emoji: '🔥' },
                { key: 'shadow', label: 'Shadow', emoji: '⬛' },
                { key: 'pulse', label: 'Pulse', emoji: '💓' },
                { key: 'rotate', label: 'Rotate', emoji: '🔄' },
              ].map(effect => (
                <label key={effect.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg cursor-pointer">
                  <span className="text-sm flex items-center gap-2">{effect.emoji} {effect.label}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={Boolean(object.properties[effect.key])}
                      onChange={(e) => updateProp(effect.key, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${object.properties[effect.key] ? 'bg-violet-500' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${object.properties[effect.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onUpdate(object.id, { x: object.x - 40, y: object.y })}
            className="py-1 text-xs bg-white rounded border border-slate-200 hover:bg-slate-100"
          >
            ← Left
          </button>
          <button
            onClick={() => onUpdate(object.id, { x: object.x, y: object.y - 40 })}
            className="py-1 text-xs bg-white rounded border border-slate-200 hover:bg-slate-100"
          >
            ↑ Up
          </button>
          <button
            onClick={() => onUpdate(object.id, { x: object.x + 40, y: object.y })}
            className="py-1 text-xs bg-white rounded border border-slate-200 hover:bg-slate-100"
          >
            Right →
          </button>
          <button
            onClick={() => onUpdate(object.id, { x: object.x, y: object.y + 40 })}
            className="py-1 text-xs bg-white rounded border border-slate-200 hover:bg-slate-100 col-span-3"
          >
            ↓ Down
          </button>
        </div>
      </div>
    </div>
  );
};
