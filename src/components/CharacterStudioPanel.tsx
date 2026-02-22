import React, { useState } from 'react';
import { SpriteState } from '../types';
import { Ghost, Paintbrush, Sparkles, Loader2 } from 'lucide-react';

interface CharacterStudioPanelProps {
  spriteState: SpriteState;
  onStateChange: (newState: SpriteState) => void;
  onGenerateSprite: () => void;
  isGeneratingSprite: boolean;
  showPixelEditor: boolean;
  onShowPixelEditor: () => void;
}

const CharacterStudioPanel: React.FC<CharacterStudioPanelProps> = ({ 
  spriteState, 
  onStateChange, 
  onGenerateSprite,
  isGeneratingSprite,
  showPixelEditor,
  onShowPixelEditor
}) => {
  const updateSpriteState = (newState: Partial<SpriteState>) => {
    onStateChange({ ...spriteState, ...newState });
  };

  // Import CHARACTER_PALETTE from constants
  const CHARACTER_PALETTE = [
    { emoji: '🤖', label: 'Robot' },
    { emoji: '👾', label: 'Alien' },
    { emoji: '👦', label: 'Boy' },
    { emoji: '👧', label: 'Girl' },
    { emoji: '👨', label: 'Man' },
    { emoji: '👩', label: 'Woman' },
    { emoji: '👸', label: 'Princess' },
    { emoji: '🤴', label: 'Prince' },
    { emoji: '🥷', label: 'Ninja' },
    { emoji: '🧛', label: 'Vampire' },
    { emoji: '🧟', label: 'Zombie' },
    { emoji: '🧙', label: 'Wizard' },
    { emoji: '🧚', label: 'Fairy' },
    { emoji: '😎', label: 'Cool Hero' },
    { emoji: '🤠', label: 'Cowboy' },
    { emoji: '👮', label: 'Officer' },
    { emoji: '💃', label: 'Dancer' },
    { emoji: '🕺', label: 'Disco' },
    { emoji: '🐱', label: 'Cat' },
    { emoji: '🐶', label: 'Dog' },
    { emoji: '🐯', label: 'Tiger' },
    { emoji: '🦄', label: 'Unicorn' },
    { emoji: '🐲', label: 'Dragon' },
    { emoji: '👻', label: 'Ghost' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Ghost className="text-violet-500" /> Sprite Studio
        </h3>
        <p className="text-xs text-slate-400">Design your hero!</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }}>

        {/* Preview Box */}
        <div className="aspect-square bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 mb-6 flex items-center justify-center relative overflow-hidden shadow-inner group">
          <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] opacity-10"></div>
          <div
            className="transition-transform duration-200 relative z-10"
            style={{
              transform: `scale(${spriteState.scale}) rotate(${spriteState.rotation}deg)`,
              opacity: spriteState.opacity / 100
            }}
          >
            {spriteState.texture ? (
              <img src={spriteState.texture} className="w-24 h-24 object-contain pixelated" />
            ) : (
              <span className="text-6xl filter drop-shadow-lg">{spriteState.emoji}</span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full">Preview</span>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onShowPixelEditor}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Paintbrush size={18} /> Draw Pixel Art
          </button>
          <button
            onClick={onGenerateSprite}
            disabled={isGeneratingSprite}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingSprite ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isGeneratingSprite ? 'Creating...' : 'AI Generate'}
          </button>
        </div>

        {/* Visual Tweaks */}
        <div className="space-y-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Size ({Math.round(spriteState.scale * 100)}%)</label>
            <input
              type="range" min="0.2" max="3" step="0.1"
              value={spriteState.scale}
              onChange={(e) => updateSpriteState({ scale: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg accent-violet-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Rotation ({Math.round(spriteState.rotation)}°)</label>
            <input
              type="range" min="0" max="360"
              value={spriteState.rotation}
              onChange={(e) => updateSpriteState({ rotation: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg accent-violet-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Opacity ({spriteState.opacity}%)</label>
            <input
              type="range" min="0" max="100"
              value={spriteState.opacity}
              onChange={(e) => updateSpriteState({ opacity: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg accent-violet-500"
            />
          </div>
        </div>

        {/* Emoji Picker */}
        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">Quick Avatar</h4>
        <div className="grid grid-cols-5 gap-2">
          {CHARACTER_PALETTE.map(char => (
            <button
              key={char.emoji}
              onClick={() => updateSpriteState({ emoji: char.emoji, texture: null })}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white dark:bg-slate-800 border-2 transition-all
                ${spriteState.emoji === char.emoji && !spriteState.texture ? 'border-violet-500 shadow-md scale-110' : 'border-slate-100 dark:border-slate-700 hover:border-violet-200'}
              `}
              title={char.label}
            >
              {char.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterStudioPanel;