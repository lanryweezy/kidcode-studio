import React, { useState } from 'react';
import { SpriteState, InventoryItem, DialogueNode, BossState } from '../types';
import { Box, Heart, Sword, Shield, X, ChevronRight, MessageSquare, SkipForward } from 'lucide-react';
import { useStore } from '../store/useStore';

interface GameUIOverlayProps {
  spriteState: SpriteState;
  onUseItem: (item: InventoryItem) => void;
  onDialogueChoice: (choiceId: string) => void;
  onCloseDialogue: () => void;
}

const GameUIOverlay: React.FC<GameUIOverlayProps> = ({ 
  spriteState, 
  onUseItem, 
  onDialogueChoice,
  onCloseDialogue
}) => {
  const { isDialogueActive, activeDialogue, inventory, activeBoss } = spriteState;
  const [showInventory, setShowInventory] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // === INVENTORY UI ===
  const InventoryUI = () => (
    <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden z-50">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="text-white font-black flex items-center gap-2">
          <Box size={18} className="text-amber-400" /> INVENTORY
        </h3>
        <button onClick={() => setShowInventory(false)} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-3 max-h-64 overflow-y-auto">
        {inventory.length === 0 ? (
          <div className="text-slate-400 text-sm text-center py-4">Empty inventory</div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {inventory.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItemIndex(index);
                  onUseItem(item);
                }}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all hover:scale-110 ${
                  selectedItemIndex === index 
                    ? 'border-green-400 bg-green-900/30' 
                    : 'border-slate-600 bg-slate-800 hover:border-amber-400'
                }`}
              >
                <div className="text-2xl">{item.icon}</div>
                {item.quantity > 1 && (
                  <div className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white bg-slate-700 px-1 rounded">
                    {item.quantity}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {inventory.length > 0 && selectedItemIndex >= 0 && inventory[selectedItemIndex] && (
        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
          <div className="text-white font-bold text-sm">{inventory[selectedItemIndex].name}</div>
          <div className="text-slate-400 text-xs">{inventory[selectedItemIndex].description}</div>
          {inventory[selectedItemIndex].effect && (
            <div className="text-green-400 text-[10px] mt-1">
              Effect: {inventory[selectedItemIndex].effect?.type} +{inventory[selectedItemIndex].effect?.value}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // === DIALOGUE UI ===
  const DialogueUI = () => {
    if (!activeDialogue) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 p-8 z-50">
        <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-sm rounded-3xl border-2 border-indigo-500 shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
          {/* Speaker Header */}
          <div className="bg-indigo-600 px-6 py-3 flex items-center gap-4">
            <div className="text-4xl">{activeDialogue.speakerEmoji || '👤'}</div>
            <div>
              <div className="text-white font-black text-lg">{activeDialogue.speaker}</div>
            </div>
          </div>
          
          {/* Dialogue Text */}
          <div className="p-6">
            <p className="text-white text-lg leading-relaxed mb-6">{activeDialogue.text}</p>
            
            {/* Choices */}
            {activeDialogue.choices && activeDialogue.choices.length > 0 && (
              <div className="space-y-2">
                {activeDialogue.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => onDialogueChoice(choice.nextId)}
                    className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-indigo-600 rounded-xl border border-slate-700 hover:border-indigo-400 transition-all flex items-center justify-between group"
                  >
                    <span className="text-white font-medium">{choice.text}</span>
                    <ChevronRight size={20} className="text-slate-400 group-hover:text-white" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Continue without choices */}
            {!activeDialogue.choices && (
              <button
                onClick={() => onCloseDialogue()}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span className="text-white font-bold">Continue</span>
                <SkipForward size={18} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // === BOSS HEALTH BAR UI ===
  const BossHealthUI = () => {
    if (!activeBoss) return null;

    const healthPercent = (activeBoss.health / activeBoss.maxHealth) * 100;

    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl border-2 border-red-600 shadow-2xl px-6 py-3 min-w-[400px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{activeBoss.emoji}</div>
              <div>
                <div className="text-white font-black text-lg">{activeBoss.name}</div>
                <div className="text-red-400 text-xs font-bold">
                  PHASE {activeBoss.phase} {activeBoss.isInvulnerable && '• INVULNERABLE'}
                </div>
              </div>
            </div>
            <div className="text-white font-mono font-bold">
              {activeBoss.health} / {activeBoss.maxHealth} HP
            </div>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all ${
                healthPercent > 60 ? 'bg-red-500' : healthPercent > 30 ? 'bg-orange-500' : 'bg-red-700 animate-pulse'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // === HUD (Heads Up Display) ===
  const HUD = () => (
    <div className="absolute top-4 left-4 z-40">
      <div className="flex flex-col gap-2">
        {/* Health */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-700">
          <Heart size={20} className="text-red-500 fill-red-500" />
          <div className="text-white font-black">{spriteState.health}/{spriteState.maxHealth}</div>
        </div>
        
        {/* Score */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-700">
          <Box size={20} className="text-yellow-500" />
          <div className="text-white font-black">{spriteState.score}</div>
        </div>
        
        {/* Keys/Items */}
        {spriteState.keys > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-700">
            <Box size={20} className="text-amber-400" />
            <div className="text-white font-black">x{spriteState.keys}</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* HUD is always visible */}
      <HUD />
      
      {/* Boss health bar */}
      <BossHealthUI />
      
      {/* Inventory button (pointer-events-auto for interaction) */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          onClick={() => setShowInventory(!showInventory)}
          className="bg-slate-900/80 backdrop-blur-sm hover:bg-amber-600 rounded-xl p-3 border-2 border-slate-700 hover:border-amber-400 transition-all"
        >
          <Box size={24} className="text-amber-400" />
        </button>
      </div>
      
      {/* Inventory UI */}
      {showInventory && <div className="pointer-events-auto"><InventoryUI /></div>}
      
      {/* Dialogue UI */}
      {isDialogueActive && <div className="pointer-events-auto"><DialogueUI /></div>}
    </div>
  );
};

export default GameUIOverlay;
