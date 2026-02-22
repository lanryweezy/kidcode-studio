
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Film, Plus, Trash2, Check, X } from 'lucide-react';

const AnimationSequencer: React.FC = () => {
  const { spriteState, updateSpriteState } = useStore();
  const { animations, frames } = spriteState;

  const [selectedAnim, setSelectedAnim] = useState<string | null>(
    animations && Object.keys(animations).length > 0 ? Object.keys(animations)[0] : null
  );
  const [newAnimName, setNewAnimName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddAnimation = () => {
    if (newAnimName && !animations[newAnimName]) {
      const newAnims = { ...animations, [newAnimName]: [] };
      updateSpriteState({ animations: newAnims });
      setSelectedAnim(newAnimName);
      setNewAnimName('');
      setIsAdding(false);
    }
  };

  const handleToggleFrame = (frameIndex: number) => {
    if (!selectedAnim) return;
    const currentFrames = animations[selectedAnim] || [];
    const newFrames = currentFrames.includes(frameIndex)
      ? currentFrames.filter(f => f !== frameIndex)
      : [...currentFrames, frameIndex];
    
    updateSpriteState({
      animations: { ...animations, [selectedAnim]: newFrames.sort((a,b) => a-b) }
    });
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 h-64 flex flex-col">
      <h4 className="font-bold text-xs uppercase text-slate-400 mb-4 flex items-center gap-2">
        <Film size={16} /> Animation Sequencer
      </h4>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Animation List */}
        <div className="w-40 flex flex-col gap-2">
          {Object.keys(animations || {}).map(name => (
            <button 
              key={name}
              onClick={() => setSelectedAnim(name)}
              className={`w-full p-2 text-left text-sm font-bold rounded-lg transition-all ${selectedAnim === name ? 'bg-violet-500 text-white shadow' : 'bg-white dark:bg-slate-800 hover:bg-slate-200'}`}
            >
              {name}
            </button>
          ))}
          {isAdding ? (
              <div className="flex gap-1">
                  <input
                    value={newAnimName}
                    onChange={e => setNewAnimName(e.target.value)}
                    placeholder="walk_cycle"
                    className="flex-1 w-0 bg-white dark:bg-slate-700 text-sm p-2 rounded-lg outline-none"
                  />
                  <button onClick={handleAddAnimation} className="p-2 bg-green-500 text-white rounded-lg"><Check size={16}/></button>
                  <button onClick={() => setIsAdding(false)} className="p-2 bg-red-500 text-white rounded-lg"><X size={16}/></button>
              </div>
          ) : (
             <button onClick={() => setIsAdding(true)} className="w-full p-2 text-sm font-bold rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:bg-white dark:hover:bg-slate-800">
                <Plus size={14} className="inline mr-1" /> New Anim
            </button>
          )}
        </div>

        {/* Frame Timeline */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-2 flex items-center gap-2 overflow-x-auto shadow-inner custom-scrollbar">
          {frames && frames.length > 0 ? frames.map((frame, i) => (
            <div 
              key={i}
              onClick={() => handleToggleFrame(i)}
              className={`
                relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer
                ${selectedAnim && animations[selectedAnim]?.includes(i) ? 'border-violet-500 scale-105' : 'border-slate-200 dark:border-slate-700'}
              `}
            >
              <img src={frame} className="w-full h-full object-contain" alt={`Frame ${i}`} />
              {selectedAnim && animations[selectedAnim]?.includes(i) && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-violet-500 text-white rounded-full flex items-center justify-center border-2 border-white">
                      <Check size={10} />
                  </div>
              )}
            </div>
          )) : <p className="text-xs text-slate-400 italic text-center w-full">No sprite sheet frames loaded. Use the Sprite Editor to import one.</p>}
        </div>
      </div>
    </div>
  );
};

export default AnimationSequencer;
